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
import { Payment_Method } from "@prisma/client";
import { EXPIRY_DATE_MIDTRANS } from "../../infrastructure/utils/constant";
import { getFormattedStartTime } from "../../infrastructure/utils/time-formater";

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
	.patch(
		"/:id",
		async ({ set, body, user, params }) => {
			try {
				const startTime = getFormattedStartTime();
				const payment = await paymentService.getOne(params.id);
				if (!payment.booking.start_date || !payment.booking.end_date) {
					return response.badRequest(
						"Start date and end date must be provided",
					);
				}
				const durationInMs =
					payment.booking.end_date.getTime() -
					payment.booking.start_date.getTime();
				const durationInDays = Math.ceil(
					durationInMs / (1000 * 60 * 60 * 24) + 1,
				);
				let item_details: any = [];
				let gross_amount = 0;
				if (payment.booking.travel_package) {
					const pkg = payment.booking.travel_package;
					item_details = [
						{
							id: pkg.id,
							name: pkg.name,
							price: Number(pkg.price),
							quantity: durationInDays,
						},
					];
					gross_amount = Number(payment.total_amount);
				} else if (payment.booking.vehicle_id) {
					const vehicle = await vehicleService.getOne(
						payment.booking.vehicle_id,
					);
					item_details = [
						{
							id: vehicle.id,
							name: vehicle.name,
							price: Number(vehicle.price_per_day),
							quantity: durationInDays,
						},
					];
					gross_amount = Number(payment.total_amount);
				}
				const parameter = {
					transaction_details: {
						order_id: payment.booking.id,
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
					{ snapResponse: snapResponse, payment_id: payment.id },
					"Payment created & Midtrans token generated successfully",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				payment_method: t.Enum(Payment_Method, {
					error: "payment method must be filled",
				}),
			}),
		},
	);
