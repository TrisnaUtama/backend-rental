import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import {
	paymentService,
	rescheduleService,
	userService,
} from "../../application/instances";
import { bookingService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { response } from "../../application/instances";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import type {
	CreateBooking,
	UpdateBooking,
} from "../../infrastructure/entity/types";
import { Decimal } from "@prisma/client/runtime/library";
import { Booking_Status } from "@prisma/client";
import { emailService } from "../../application/instances";

const RequestRefundBody = t.Object({
	reason: t.String({ error: "A reason is required for the refund request." }),
	bank_name: t.String(),
	account_holder: t.String(),
	account_number: t.String(),
});

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
	.get("/available-vehicles", async ({ query, set }) => {
		try {
			const { vehicleIds } = query;

			if (!vehicleIds) {
				set.status = 400;
				return { error: "vehicleIds query parameter is required" };
			}

			const ids = vehicleIds.split(",").map((id) => id.trim());

			if (ids.length === 0) {
				set.status = 400;
				return { error: "No valid vehicle IDs provided" };
			}

			const unavailableDates =
				await bookingService.findAvailableVehicleById(ids);

			return { unavailableDates };
		} catch (error) {
			set.status = 500;
			return { error: "Internal server error" };
		}
	})
	.get(
		"/fully-booked-dates",
		async ({ query, set }) => {
			try {
				const ids = query.vehicleIds
					.split(",")
					.map((id) => id.trim())
					.filter(Boolean);

				if (ids.length === 0) {
					set.status = 400;
					return { error: "No valid vehicle IDs provided" };
				}

				const datesToDisable = await bookingService.findFullyBookedDates(ids);

				return { data: datesToDisable };
			} catch (error) {
				console.error("Error in /fully-booked-dates:", error);
				set.status = 500;
				return { error: "Internal server error" };
			}
		},
		{
			query: t.Object({
				vehicleIds: t.String({
					minLength: 1,
					error: "vehicleIds query parameter is required and cannot be empty.",
				}),
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
	.post(
		"/unavailable-dates-for-vehicles",
		async ({ set, body }) => {
			try {
				const unavailableDates =
					await bookingService.getUnavailableDatesForVehicles(body);
				return StandardResponse.success(
					unavailableDates,
					"Unavailable dates fetched successfully",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				vehicleIds: t.Array(t.String()),
				excludeBookingId: t.String(),
			}),
		},
	)
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
		"/:bookingId/refund-request",
		async ({ set, params, body, user }) => {
			try {
				const newRefundRequest = await bookingService.requestRefund(
					user.id,
					params.bookingId,
					body,
				);

				return StandardResponse.success(
					newRefundRequest,
					"Refund request submitted successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: RequestRefundBody,
			params: t.Object({
				bookingId: t.String(),
			}),
		},
	)
	.post(
		"/:bookingId/reschedule",
		async ({ set, body, params, user }) => {
			try {
				const { bookingId } = params;
				const userId = user.id;
				const originalBooking = await bookingService.getOne(bookingId);
				if (!originalBooking) {
					throw response.notFound("Booking not found.");
				}
				if (originalBooking.user_id !== userId) {
					throw response.forbidden(
						"You are not authorized to modify this booking.",
					);
				}
				const newRescheduleRequest = await bookingService.requestReschedule(
					bookingId,
					body,
				);

				return StandardResponse.success(
					newRescheduleRequest,
					"Reschedule request submitted successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				new_start_date: t.Date({
					format: "date-time",
					error: "new_start_date must be a valid ISO date string.",
				}),
				new_end_date: t.Date({
					format: "date-time",
					error: "new_end_date must be a valid ISO date string.",
				}),
			}),
			params: t.Object({
				bookingId: t.String(),
			}),
		},
	)
	.post(
		"/",
		async ({ set, body, user }) => {
			try {
				const payload: CreateBooking = {
					user_id: user.id,
					promo_id: body.promo_id || null,
					pax_option_id: body.pax_option_id || null,
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
					body.pax_option_id,
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
				pax_option_id: t.Optional(t.String()),
				vehicle_ids: t.Optional(t.Array(t.String())),
				licences_id: t.String(),
				card_id: t.String(),
				pick_up_at_airport: t.Boolean(),
				notes: t.Optional(t.String()),
				start_date: t.Date(),
				end_date: t.Optional(t.Date()),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ set, params, body }) => {
			try {
				const existing_booking = await bookingService.getOne(params.id);
				if (!existing_booking) {
					throw response.badRequest("Error while retrieving Booking");
				}
				const payload: UpdateBooking = {
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
					const paymentPayload = {
						expiry_date: null,
						payment_date: null,
						payment_method: "",
						payment_status: "PENDING",
						total_amount: update_booking.total_price ?? new Decimal(0),
						booking: {
							connect: {
								id: update_booking.id,
							},
						},
					};
					await emailService.sendBookingStatusNotification(
						existing_booking.user_id,
						{
							id: update_booking.id,
							travel_package_name: existing_booking.travel_package?.name,
							vehicle_name:
								existing_booking.booking_vehicles?.[0]?.vehicle?.name,
							start_date: update_booking.start_date,
							end_date: update_booking.end_date as Date,
							total_price: update_booking.total_price ?? new Decimal(0),
						},
						"RECEIVED",
					);
					const create_payment = await paymentService.create(paymentPayload);
					if (!create_payment) {
						throw response.badRequest("Error while creating payment");
					}
				}
				if (update_booking.status === "REJECTED_BOOKING") {
					await emailService.sendBookingStatusNotification(
						existing_booking.user_id,
						{
							id: update_booking.id,
							travel_package_name: existing_booking.travel_package?.name,
							vehicle_name:
								existing_booking.booking_vehicles?.[0]?.vehicle?.name,
							start_date: update_booking.start_date,
							end_date: update_booking.end_date as Date,
							total_price: update_booking.total_price ?? new Decimal(0),
						},
						"REJECTED",
					);
				}
				if (update_booking.status === "REJECTED_RESHEDULE") {
					const latestReschedule = [...update_booking.RescheduleRequests].sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					)[0];

					const new_start_date = latestReschedule.new_start_date;
					const new_end_date = latestReschedule.new_end_date;
					const pendingRequest = update_booking.RescheduleRequests?.find(
						(req) => req.status === "PENDING",
					);
					if (pendingRequest) {
						await rescheduleService.update(pendingRequest.id, {
							status: "REJECTED",
						});
					}
					await emailService.sendRescheduleStatusNotification(
						existing_booking.user_id,
						{
							id: update_booking.id,
							travel_package_name: existing_booking.travel_package?.name,
							vehicle_name:
								existing_booking.booking_vehicles?.[0]?.vehicle?.name,
							start_date: update_booking.start_date,
							new_start_date: new_start_date,
							new_end_date: new_end_date,
							end_date: update_booking.end_date as Date,
							total_price: update_booking.total_price ?? new Decimal(0),
						},
						"REJECTED",
					);
				}
				if (update_booking.status === "RESCHEDULED") {
					const latestReschedule = [...update_booking.RescheduleRequests].sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					)[0];

					const new_start_date = latestReschedule.new_start_date;
					const new_end_date = latestReschedule.new_end_date;
					const pendingRequest = update_booking.RescheduleRequests?.find(
						(req) => req.status === "PENDING",
					);

					if (!pendingRequest) {
						throw response.badRequest(
							"Cannot set status to RESCHEDULED: No pending reschedule request found.",
						);
					}

					await bookingService.update(update_booking.id, {
						start_date: pendingRequest.new_start_date,
						end_date: pendingRequest.new_end_date,
						status: "RESCHEDULED",
					});

					await rescheduleService.update(pendingRequest.id, {
						status: "APPROVED",
					});

					await emailService.sendRescheduleStatusNotification(
						existing_booking.user_id,
						{
							id: update_booking.id,
							travel_package_name: existing_booking.travel_package?.name,
							vehicle_name:
								existing_booking.booking_vehicles?.[0]?.vehicle?.name,
							start_date: update_booking.start_date,
							end_date: update_booking.end_date as Date,
							new_start_date: new_start_date,
							new_end_date: new_end_date,
							total_price: update_booking.total_price ?? new Decimal(0),
						},
						"APPROVED",
					);
				}
				set.status = 200;
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
					pax_option_id: t.Optional(t.String()),
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
		async ({ set, params, body }) => {
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
