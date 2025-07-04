import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import {
	userService,
	paymentService,
	vehicleService,
	midtrans,
	bookingService,
} from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { response } from "../../application/instances";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import { Booking_Status, Payment_Status } from "@prisma/client";
import { EXPIRY_DATE_MIDTRANS } from "../../infrastructure/utils/constant";
import { getFormattedStartTime } from "../../infrastructure/utils/time-formater";
import crypto from "node:crypto";
import { Decimal } from "@prisma/client/runtime/library";

const MidtransNotificationSchema = t.Object({
	order_id: t.String({ error: "order_id is required" }),
	status_code: t.String({ error: "status code is required" }),
	transaction_status: t.String({ error: "transaction status is required" }),
	gross_amount: t.String({ error: "grossAmount is required" }),
	fraud_status: t.Optional(t.String()),
	payment_type: t.Optional(t.String()),
	signature_key: t.String({ error: "signature_key is required" }),
});

export const paymentRoute = new Elysia({
	prefix: "/v1/payments",
	detail: {
		tags: ["PAYMENTS"],
	},
})
	.post(
		"/notification-handler",
		async ({ body, set }) => {
			try {
				const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
				const localHash = crypto
					.createHash("sha512")
					.update(
						`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`,
					)
					.digest("hex");

				if (body.signature_key !== localHash) {
					console.warn("Invalid signature for order:", body.order_id);
					set.status = 400;
					return "not same";
				}

				const payment = await paymentService.getByOrderid(body.order_id);
				if (!payment) {
					console.warn("Payment not found for order:", body.order_id);
					set.status = 404;
					return "not found";
				}

				let statusToUpdate: Payment_Status;
				let statusBooking: Booking_Status;
				switch (body.transaction_status) {
					case "capture":
						statusToUpdate =
							body.fraud_status === "accept"
								? Payment_Status.PAID
								: body.fraud_status === "challenge"
									? Payment_Status.PENDING
									: Payment_Status.FAILED;
						statusBooking =
							body.fraud_status === "accept"
								? Booking_Status.CONFIRMED
								: Booking_Status.PAYMENT_PENDING;
						break;
					case "settlement":
						statusToUpdate = Payment_Status.PAID;
						statusBooking = Booking_Status.CONFIRMED;
						break;
					case "cancel":
						statusToUpdate = Payment_Status.EXPIRED;
						statusBooking = Booking_Status.PAYMENT_PENDING;
						break;
					case "deny":
					case "expire":
						statusToUpdate = Payment_Status.FAILED;
						statusBooking = Booking_Status.PAYMENT_PENDING;
						break;
					case "pending":
						statusToUpdate = Payment_Status.PENDING;
						statusBooking = Booking_Status.PAYMENT_PENDING;
						break;
					default:
						statusToUpdate = Payment_Status.FAILED;
						statusBooking = Booking_Status.PAYMENT_PENDING;
				}
				await paymentService.update(payment.booking_id, {
					payment_status: statusToUpdate,
					payment_method: body.payment_type,
					payment_date: new Date(),
					total_amount: new Decimal(body.gross_amount),
				});

				await bookingService.update(payment.booking_id, {
					status: statusBooking,
				});

				set.status = 200;
				return "OK";
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: MidtransNotificationSchema,
		},
	)
	.use(
		jwt({
			name: `${process.env.JWT_NAME}`,
			secret: `${process.env.JWT_SECRET_KEY}`,
		}),
	)
	.derive(async ({ cookie: { access_token }, set }) => {
		if (!access_token.value) {
			set.status = 401;
			throw response.unauthorized();
		}
		const jwtPayload: IJwtPayload = verifyJwt(access_token.value.toString());
		if (!jwtPayload) {
			set.status = 403;
			throw response.forbidden();
		}
		const userId = jwtPayload.user_id;
		if (!userId) throw response.badRequest("Invalid Payload !");
		const user = await userService.getOne(userId.toString());
		if (!user || !user.refresh_token || user.role === "DRIVER") {
			set.status = 403;
			throw response.forbidden();
		}
		return {
			user,
		};
	})
	.get("/", async ({ set }) => {
		try {
			const payments = await paymentService.getAll();
			if (!payments) {
				set.status = 400;
				throw response.badRequest("Error while retreiving data payments");
			}
			set.status = 200;
			return StandardResponse.success(payments);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ set, params }) => {
		try {
			const payments = await paymentService.getOne(params.id);
			if (!payments) {
				set.status = 400;
				throw response.badRequest(
					`Error while retreiving data payment with id ${params.id}`,
				);
			}
			set.status = 200;
			return StandardResponse.success(payments);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/order-id/:id", async ({ set, body, params }) => {
		try {
			const payments = await paymentService.getOne(params.id);
			if (!payments) {
				set.status = 400;
				throw response.badRequest(
					`Error while retreiving data payment with booking id ${params.id}`,
				);
			}
			set.status = 200;
			return StandardResponse.success(payments);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.patch("/:id", async ({ set, user, params }) => {
		try {
			const payment = await paymentService.getOne(params.id);
			if (!payment) {
				return response.notFound("Payment record not found");
			}
			if (
				payment.token &&
				payment.expiry_date &&
				new Date() < new Date(payment.expiry_date)
			) {
				set.status = 200;
				return StandardResponse.success(
					{ token: payment.token, payment_id: payment.id },
					"Existing Midtrans token returned successfully",
				);
			}
			const booking = payment.booking;
			const startTime = getFormattedStartTime();

			if (!booking.start_date || !booking.end_date) {
				return response.badRequest("Start date and end date must be provided");
			}

			const durationInMs =
				booking.end_date.getTime() - booking.start_date.getTime();
			const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
			let item_details: any[] = [];
			let gross_amount = 0;

			if (booking.travel_package) {
				const pkg = booking.travel_package;
				const matchedPax = pkg.pax_options.find(
					(pax) => pax.id === booking.pax_option_id,
				);
				if (!matchedPax) {
					return response.badRequest("No matching Pax option found.");
				}
				item_details = [
					{
						id: `${pkg.id}-${matchedPax.pax}`,
						name: `${pkg.name} - ${matchedPax.pax} Pax`,
						price: Number(matchedPax.price),
						quantity: 1,
					},
				];
				gross_amount = Number(matchedPax.price);
			} else if (
				!booking.travel_package_id &&
				booking.booking_vehicles &&
				booking.booking_vehicles.length > 0
			) {
				const bookingVehicles = booking.booking_vehicles;
				for (const bv of bookingVehicles) {
					const vehicle = await vehicleService.getOne(bv.vehicle_id);
					if (!vehicle) {
						return response.badRequest(
							`Vehicle with id ${bv.vehicle_id} not found`,
						);
					}
					item_details.push({
						id: vehicle.id,
						name: `Rental - ${vehicle.name}`,
						price: Number(vehicle.price_per_day),
						quantity: durationInDays,
					});
					gross_amount += Number(vehicle.price_per_day) * durationInDays;
				}
			} else {
				return response.badRequest("Unsupported or unknown booking type");
			}

			if (booking.promos) {
				const discountAmount = gross_amount - Number(payment.total_amount);
				if (discountAmount > 0) {
					item_details.push({
						id: `DISC-${booking.promos.id}`,
						name: `Promo: ${booking.promos.code}`,
						price: -discountAmount,
						quantity: 1,
					});
				}
			}
			gross_amount = Number(payment.total_amount);
			const parameter = {
				transaction_details: {
					order_id: booking.id,
					gross_amount,
				},
				item_details,
				customer_details: {
					first_name: user.name,
					email: user.email,
				},
				credit_card: {
					secure: true,
				},
				expiry: {
					start_time: startTime,
					unit: "minutes",
					duration: EXPIRY_DATE_MIDTRANS,
				},
			};
			const snapResponse = await midtrans.charge(parameter);
			const expiryDate = new Date();
			expiryDate.setMinutes(expiryDate.getMinutes() + EXPIRY_DATE_MIDTRANS);
			await paymentService.update(params.id, {
				token: snapResponse,
				expiry_date: expiryDate,
			});
			set.status = 200;
			return StandardResponse.success(
				{ token: snapResponse, payment_id: payment.id },
				"Payment created & Midtrans token generated successfully",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
