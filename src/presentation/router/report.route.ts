import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { userService, reportService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { response } from "../../application/instances";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import {
	Booking_Status,
	Payment_Status,
	Refund_Status,
	RescheduleStatus,
	Roles,
	RatedEntityType,
} from "@prisma/client";

export const reportRoute = new Elysia({
	prefix: "/v1/reports",
	detail: {
		tags: ["REPORTS"],
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
		if (
			!user ||
			!user.refresh_token ||
			user.role === Roles.DRIVER ||
			user.role === Roles.CUSTOMER
		) {
			set.status = 403;
			throw response.forbidden();
		}
		return {
			user,
		};
	})

	.get(
		"/overall-business-summary",
		async ({ query, user, set }) => {
			try {
				if (user.role !== Roles.SUPERADMIN) {
					set.status = 403;
					throw response.forbidden();
				}

				const startDate = new Date(query.startDate);
				const endDate = new Date(query.endDate);

				if (
					Number.isNaN(startDate.getTime()) ||
					Number.isNaN(endDate.getTime())
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getOverallBusinessSummary(
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error("Failed to retrieve overall business summary data.");
				}

				return StandardResponse.success(
					result,
					"Overall business summary retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				startDate: t.String({
					format: "date-time",
					description: "Start date for the report (ISO 8601 format)",
				}),
				endDate: t.String({
					format: "date-time",
					description: "End date for the report (ISO 8601 format)",
				}),
			}),
			detail: {
				summary: "Get overall business summary (SUPERADMIN)",
			},
		},
	)

	.get(
		"/financial-summary",
		async ({ query, user, set }) => {
			try {
				if (
					user.role !== Roles.SUPERADMIN &&
					user.role !== Roles.ADMIN_FINANCE
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const startDate = new Date(query.startDate);
				const endDate = new Date(query.endDate);

				if (
					Number.isNaN(startDate.getTime()) ||
					Number.isNaN(endDate.getTime())
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getFinancialSummary(
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error("Failed to retrieve financial summary data.");
				}

				return StandardResponse.success(
					result,
					"Financial summary retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				startDate: t.String({
					format: "date-time",
					description: "Start date for the report (ISO 8601 format)",
				}),
				endDate: t.String({
					format: "date-time",
					description: "End date for the report (ISO 8601 format)",
				}),
			}),
			detail: {
				summary: "Get financial summary (SUPERADMIN, ADMIN_FINANCE)",
			},
		},
	)

	.get(
		"/ratings-report",
		async ({ query, user, set }) => {
			try {
				if (user.role !== Roles.SUPERADMIN) {
					set.status = 403;
					throw response.forbidden();
				}

				const ratedType = query.ratedType as RatedEntityType | undefined;

				const result = await reportService.getRatingsReport(ratedType);

				if (result === undefined) {
					set.status = 500;
					throw new Error("Failed to retrieve ratings report data.");
				}

				return StandardResponse.success(
					result,
					"Ratings report retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				ratedType: t.Optional(
					t.Enum(RatedEntityType, {
						description: "Filter ratings by entity type",
					}),
				),
			}),
			detail: {
				summary: "Get overall ratings report (SUPERADMIN)",
			},
		},
	)

	.get(
		"/average-ratings-per-entity",
		async ({ user, set }) => {
			try {
				// Authorization: Only SUPERADMIN
				if (user.role !== Roles.SUPERADMIN) {
					set.status = 403;
					throw response.forbidden();
				}

				const result = await reportService.getAverageRatingsPerEntity();

				if (result === undefined) {
					set.status = 500;
					throw new Error(
						"Failed to retrieve average ratings per entity report data.",
					);
				}

				return StandardResponse.success(
					result,
					"Average ratings per entity report retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			detail: {
				summary: "Get average ratings per entity (SUPERADMIN)",
			},
		},
	)

	// --- ADMIN_OPERATIONAL Reports ---
	.get(
		"/operational-booking-status",
		async ({ query, user, set }) => {
			try {
				if (
					user.role !== Roles.ADMIN_OPERATIONAL &&
					user.role !== Roles.SUPERADMIN
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const status = query.status as Booking_Status;
				const startDate = query.startDate
					? new Date(query.startDate)
					: undefined;
				const endDate = query.endDate ? new Date(query.endDate) : undefined;

				if (
					(query.startDate && Number.isNaN(startDate?.getTime())) ||
					(query.endDate && Number.isNaN(endDate?.getTime()))
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getOperationalBookingStatus(
					status,
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error(
						`Failed to retrieve bookings with status '${status}' report data.`,
					);
				}

				return StandardResponse.success(
					result,
					`Bookings with status '${status}' retrieved successfully.`,
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				status: t.Optional(
					t.Enum(Booking_Status, {
						description: "Optional booking status to filter by",
					}),
				),
				startDate: t.Optional(
					t.String({
						format: "date-time",
						description: "Optional start date for filtering bookings",
					}),
				),
				endDate: t.Optional(
					t.String({
						format: "date-time",
						description: "Optional end date for filtering bookings",
					}),
				),
			}),
			detail: {
				summary: "Get operational booking status report (ADMIN_OPERATIONAL)",
			},
		},
	)

	.get(
		"/reschedule-requests",
		async ({ query, user, set }) => {
			try {
				// Authorization: Only ADMIN_OPERATIONAL
				if (
					user.role !== Roles.ADMIN_OPERATIONAL &&
					user.role !== Roles.SUPERADMIN
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const status = query.status as RescheduleStatus | undefined;
				const startDate = query.startDate
					? new Date(query.startDate)
					: undefined;
				const endDate = query.endDate ? new Date(query.endDate) : undefined;

				if (
					(query.startDate && Number.isNaN(startDate?.getTime())) ||
					(query.endDate && Number.isNaN(endDate?.getTime()))
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getRescheduleRequestsReport(
					status,
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error(
						"Failed to retrieve reschedule requests report data.",
					);
				}

				return StandardResponse.success(
					result,
					"Reschedule requests retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				status: t.Optional(
					t.Enum(RescheduleStatus, {
						description: "Optional filter by reschedule status",
					}),
				),
				startDate: t.Optional(
					t.String({
						format: "date-time",
						description: "Optional start date for filtering requests",
					}),
				),
				endDate: t.Optional(
					t.String({
						format: "date-time",
						description: "Optional end date for filtering requests",
					}),
				),
			}),
			detail: {
				summary: "Get reschedule requests report (ADMIN_OPERATIONAL)",
			},
		},
	)

	.get(
		"/vehicle-utilization",
		async ({ query, user, set }) => {
			try {
				if (
					user.role !== Roles.ADMIN_OPERATIONAL &&
					user.role !== Roles.SUPERADMIN
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const startDate = new Date(query.startDate);
				const endDate = new Date(query.endDate);

				if (
					Number.isNaN(startDate.getTime()) ||
					Number.isNaN(endDate.getTime())
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getVehicleUtilizationReport(
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error(
						"Failed to retrieve vehicle utilization report data.",
					);
				}

				return StandardResponse.success(
					result,
					"Vehicle utilization report retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				startDate: t.String({
					format: "date-time",
					description: "Start date for the report (ISO 8601 format)",
				}),
				endDate: t.String({
					format: "date-time",
					description: "End date for the report (ISO 8601 format)",
				}),
			}),
			detail: {
				summary: "Get vehicle utilization report (ADMIN_OPERATIONAL)",
			},
		},
	)

	.get(
		"/users-and-drivers",
		async ({ query, user, set }) => {
			try {
				if (
					user.role !== Roles.ADMIN_OPERATIONAL &&
					user.role !== Roles.SUPERADMIN
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const role = query.role as Roles | undefined;

				const result = await reportService.getUsersAndDriversReport(role);

				if (result === undefined) {
					set.status = 500;
					throw new Error("Failed to retrieve users and drivers report data.");
				}

				return StandardResponse.success(
					result,
					"Users and drivers report retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				role: t.Optional(
					t.Enum(Roles, {
						description:
							"Optional filter by user role (e.g., CUSTOMER, DRIVER)",
					}),
				),
			}),
			detail: {
				summary: "Get users and drivers report (ADMIN_OPERATIONAL, SUPERADMIN)",
			},
		},
	)

	// --- ADMIN_FINANCE Reports ---
	.get(
		"/payment-transactions",
		async ({ query, user, set }) => {
			try {
				// Authorization: Only ADMIN_FINANCE
				if (
					user.role !== Roles.SUPERADMIN &&
					user.role !== Roles.ADMIN_FINANCE
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const status = query.status as Payment_Status | undefined;
				const startDate = query.startDate
					? new Date(query.startDate)
					: undefined;
				const endDate = query.endDate ? new Date(query.endDate) : undefined;

				if (
					(query.startDate && Number.isNaN(startDate?.getTime())) ||
					(query.endDate && Number.isNaN(endDate?.getTime()))
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}
				if (endDate) {
					endDate.setHours(23, 59, 59, 999);
				}

				const result = await reportService.getPaymentTransactionsReport(
					status,
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error(
						"Failed to retrieve payment transactions report data.",
					);
				}

				return StandardResponse.success(
					result,
					"Payment transactions retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				status: t.Optional(
					t.Enum(Payment_Status, {
						description: "Optional filter by payment status",
					}),
				),
				startDate: t.Optional(
					t.String({
						format: "date",
						description: "Optional start date for filtering payments",
					}),
				),
				endDate: t.Optional(
					t.String({
						format: "date",
						description: "Optional end date for filtering payments",
					}),
				),
			}),
			detail: {
				summary: "Get payment transactions report (ADMIN_FINANCE)",
			},
		},
	)
	.get(
		"/daily-summary",
		async ({ query, user, set }) => {
			try {
				if (user.role !== Roles.SUPERADMIN) {
					set.status = 403;
					throw response.forbidden();
				}
				const startDate = new Date(query.startDate);
				const endDate = new Date(query.endDate);
				if (
					Number.isNaN(startDate.getTime()) ||
					Number.isNaN(endDate.getTime())
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getDailyBusinessSummary(
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error("Failed to retrieve daily business summary data.");
				}

				return StandardResponse.success(
					result,
					"Daily business summary retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				startDate: t.String({
					format: "date-time",
					description: "Start date for the daily report (ISO 8601 format)",
				}),
				endDate: t.String({
					format: "date-time",
					description: "End date for the daily report (ISO 8601 format)",
				}),
			}),
			detail: {
				summary: "Get daily business summary (SUPERADMIN)",
			},
		},
	)
	.get(
		"/refund-requests",
		async ({ query, user, set }) => {
			try {
				if (
					user.role !== Roles.ADMIN_FINANCE &&
					user.role !== Roles.SUPERADMIN
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const status = query.status as Refund_Status | undefined;
				const startDate = query.startDate
					? new Date(query.startDate)
					: undefined;
				const endDate = query.endDate ? new Date(query.endDate) : undefined;

				if (
					(query.startDate && Number.isNaN(startDate?.getTime())) ||
					(query.endDate && Number.isNaN(endDate?.getTime()))
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getRefundRequestsReport(
					status,
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error("Failed to retrieve refund requests report data.");
				}

				return StandardResponse.success(
					result,
					"Refund requests retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				status: t.Optional(
					t.Enum(Refund_Status, {
						description: "Optional filter by refund status",
					}),
				),
				startDate: t.Optional(
					t.String({
						format: "date-time",
						description: "Optional start date for filtering refunds",
					}),
				),
				endDate: t.Optional(
					t.String({
						format: "date-time",
						description: "Optional end date for filtering refunds",
					}),
				),
			}),
			detail: {
				summary: "Get refund requests report (ADMIN_FINANCE)",
			},
		},
	)

	.get(
		"/promo-usage",
		async ({ query, user, set }) => {
			try {
				// Authorization: Only ADMIN_FINANCE
				if (
					user.role !== Roles.ADMIN_FINANCE &&
					user.role !== Roles.SUPERADMIN
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const startDate = new Date(query.startDate);
				const endDate = new Date(query.endDate);

				if (
					Number.isNaN(startDate.getTime()) ||
					Number.isNaN(endDate.getTime())
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getPromoUsageReport(
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error("Failed to retrieve promo usage report data.");
				}

				return StandardResponse.success(
					result,
					"Promo usage report retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				startDate: t.String({
					format: "date-time",
					description: "Start date for the report (ISO 8601 format)",
				}),
				endDate: t.String({
					format: "date-time",
					description: "End date for the report (ISO 8601 format)",
				}),
			}),
			detail: {
				summary: "Get promo usage report (ADMIN_FINANCE)",
			},
		},
	)
	.get(
		"/travel-package-popularity",
		async ({ query, user, set }) => {
			try {
				if (
					user.role !== Roles.SUPERADMIN &&
					user.role !== Roles.ADMIN_OPERATIONAL
				) {
					set.status = 403;
					throw response.forbidden();
				}

				const startDate = new Date(query.startDate);
				const endDate = new Date(query.endDate);

				if (
					Number.isNaN(startDate.getTime()) ||
					Number.isNaN(endDate.getTime())
				) {
					set.status = 400;
					throw new Error("Invalid start or end date format.");
				}

				const result = await reportService.getTravelPackagePopularityReport(
					startDate,
					endDate,
				);

				if (result === undefined) {
					set.status = 500;
					throw new Error(
						"Failed to retrieve travel package popularity report data.",
					);
				}

				return StandardResponse.success(
					result,
					"Travel package popularity report retrieved successfully.",
				);
			} catch (error) {
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			query: t.Object({
				startDate: t.String({
					format: "date-time",
					description: "Start date for the report (ISO 8601 format)",
				}),
				endDate: t.String({
					format: "date-time",
					description: "End date for the report (ISO 8601 format)",
				}),
			}),
			detail: {
				summary:
					"Get travel package popularity report (SUPERADMIN, ADMIN_OPERATIONAL)",
			},
		},
	);
