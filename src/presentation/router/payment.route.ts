import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import {
	userService,
	paymentService,
	vehicleService,
	midtrans,
} from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { response } from "../../application/instances";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import { Payment_Status } from "@prisma/client";
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
			const startTime = getFormattedStartTime();
			const payment = await paymentService.getOne(params.id);

			const booking = payment.booking;

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
				const paxOptions = pkg.pax_options;

				if (!paxOptions || paxOptions.length === 0) {
					return response.badRequest(
						"Pax options not found for travel package",
					);
				}

				const matchedPax = paxOptions.find(
					(pax) => Number(pax.price) === Number(payment.total_amount),
				);

				if (!matchedPax) {
					return response.badRequest(
						"No matching Pax option found for the given payment total",
					);
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
				item_details = [];

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

			set.status = 200;
			return StandardResponse.success(
				{ token: snapResponse, payment_id: payment.id },
				"Payment created & Midtrans token generated successfully",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
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
				console.log("server key :", serverKey);
				console.log("signature :", body.signature_key);
				console.log("local hash :", localHash);
				console.log("order_id :", body.order_id);

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
				switch (body.transaction_status) {
					case "capture":
						statusToUpdate =
							body.fraud_status === "accept"
								? Payment_Status.PAID
								: body.fraud_status === "challenge"
									? Payment_Status.PENDING
									: Payment_Status.FAILED;
						break;
					case "settlement":
						statusToUpdate = Payment_Status.PAID;
						break;
					case "cancel":
					case "deny":
					case "expire":
						statusToUpdate = Payment_Status.FAILED;
						break;
					case "pending":
						statusToUpdate = Payment_Status.PENDING;
						break;
					default:
						statusToUpdate = Payment_Status.FAILED;
				}

				await paymentService.update(payment.id, {
					payment_status: statusToUpdate,
					total_amount: new Decimal(body.gross_amount),
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
	);
