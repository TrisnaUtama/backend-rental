import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { paymentService, userService } from "../../application/instances";
import { bookingService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { response } from "../../application/instances";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import type {
	CreateBooking,
	CreatePayment,
	UpdateBooking,
} from "../../infrastructure/entity/types";
import { Decimal } from "@prisma/client/runtime/library";
import { Booking_Status } from "@prisma/client";

export const bookingRoute = new Elysia({
	prefix: "/v1/bookings",
	detail: {
		tags: ["BOOKING"],
	},
})
	.post(
		"/available-cars",
		async ({ body, set }) => {
			try {
				const { start_date, end_date } = body;
				const startDate = new Date(start_date);
				const endDate = new Date(end_date);

				if (
					Number.isNaN(startDate.getTime()) ||
					Number.isNaN(endDate.getTime())
				) {
					throw response.badRequest("Invalid date format");
				}

				const availableCars = await bookingService.findAvailableVehicle(
					startDate,
					endDate,
				);

				set.status = 200;
				return StandardResponse.success(
					availableCars,
					"Successfully retrieved available cars",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				start_date: t.String({ format: "date-time" }),
				end_date: t.String({ format: "date-time" }),
			}),
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
		if (!user || !user.refresh_token) {
			set.status = 403;
			throw response.forbidden();
		}
		return {
			user,
		};
	})
	.get("/", async ({ set }) => {
		try {
			const bookings = await bookingService.getAll();
			if (!bookings) {
				throw response.badRequest(
					"Something went wrong while retreiving data Bookings",
				);
			}
			set.status = 200;
			return StandardResponse.success(
				bookings,
				"Successfully retreived Bookings",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/user", async ({ set, user }) => {
		try {
			const user_bookings = await bookingService.getByUserId(user.id);
			if (!user_bookings) {
				throw response.badRequest(
					"Something went wrong while retreiving data user booking",
				);
			}
			if (user_bookings.length === 0) {
				throw response.notFound("User didnt have any bookings");
			}
			set.status = 200;
			return StandardResponse.success(
				user_bookings,
				"Successfully retreived User Bookings",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ set, params }) => {
		try {
			const booking = await bookingService.getOne(params.id);
			if (!booking) {
				throw response.notFound("Booking not found");
			}
			set.status = 200;
			return StandardResponse.success(
				booking,
				"Successfully retreived Booking",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.post(
		"/",
		async ({ set, body, user }) => {
			try {
				const payload: CreateBooking = {
					user_id: user.id,
					promo_id: body.promo_id || null,
					travel_package_id: body.travel_package_id || null,
					licences_id: body.licences_id,
					card_id: body.card_id,
					pick_up_at_airport: body.pick_up_at_airport,
					notes: body.notes || null,
					start_date: body.start_date,
					end_date: body.end_date ?? null,
					total_price: new Decimal(0),
				};
				const create_booking = await bookingService.create(
					payload,
					body.vehicle_ids,
					body.selected_pax,
				);
				set.status = 200;
				return StandardResponse.success(
					create_booking,
					"Successfully create user booking",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				promo_id: t.Optional(t.String()),
				travel_package_id: t.Optional(t.String()),
				vehicle_ids: t.Optional(t.Array(t.String())),
				selected_pax: t.Optional(t.String()),
				licences_id: t.String(),
				card_id: t.String(),
				pick_up_at_airport: t.Boolean(),
				notes: t.Optional(t.String()),
				start_date: t.Date(),
				end_date: t.Optional(t.Union([t.Date(), t.Null()])),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ set, params, body, user }) => {
			try {
				const existing_booking = await bookingService.getOne(params.id);
				if (!existing_booking) {
					throw response.badRequest("Error while retrieving Booking");
				}
				const payload: UpdateBooking = {
					user_id: user.id,
					promo_id: body.promo_id || null,
					travel_package_id: body.travel_package_id || null,
					licences_id: body.licences_id,
					card_id: body.card_id,
					pick_up_at_airport: body.pick_up_at_airport,
					notes: body.notes || null,
					start_date: body.start_date,
					end_date: body.end_date,
					status: body.status,
				};
				const update_booking = await bookingService.update(params.id, payload);
				if (!update_booking) {
					throw response.badRequest("Error while updating booking!");
				}

				if (update_booking.status === "RECEIVED") {
					const payload: CreatePayment = {
						booking_id: update_booking.id,
						expiry_date: null,
						payment_date: null,
						payment_method: null,
						payment_status: "PENDING",
						total_amount: update_booking.total_price ?? new Decimal(0),
					};
					const create_payment = await paymentService.create(payload);
					if (!create_payment) {
						throw response.badRequest("Error while creating payment");
					}
				}
				return StandardResponse.success(
					update_booking,
					"Successfully updated booking",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Partial(
				t.Object({
					promo_id: t.Optional(t.String()),
					travel_package_id: t.Optional(t.String()),
					vehicle_ids: t.Optional(t.Array(t.String())),
					selected_pax: t.Optional(t.String()),
					licences_id: t.String(),
					card_id: t.String(),
					pick_up_at_airport: t.Boolean(),
					notes: t.Optional(t.String()),
					start_date: t.Date(),
					end_date: t.Date(),
					status: t.Enum(Booking_Status),
				}),
			),
		},
	)
	.patch(
		"/assign-vehicle/:id",
		async ({ set, params, body, user }) => {
			try {
				const result = await bookingService.assignVehicleAndConfirm(
					params.id,
					body.vehicle_ids,
				);
				set.status = 200;
				return StandardResponse.success(
					result,
					"Successfully assigned vehicle and confirmed booking",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				vehicle_ids: t.Array(t.String(), {
					error: "vehicle_ids must be an array of vehicle UUIDs",
				}),
			}),
		},
	);
