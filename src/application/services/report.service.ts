import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { BookingRepository } from "../../infrastructure/repositories/booking.repo";
import {
	Booking_Status,
	Payment_Status,
	Refund_Status,
	type RescheduleStatus,
	type Roles,
	type RatedEntityType,
} from "@prisma/client";
import type { UserRepository } from "../../infrastructure/repositories/user.repo";
import { TYPES } from "../../infrastructure/entity/types";
import type { RatingRepostitory } from "../../infrastructure/repositories/rating.repo";

@injectable()
export class ReportService {
	private errorHandler: ErrorHandler;
	private bookingRepo: BookingRepository;
	private userRepo: UserRepository;
	private ratingRepo: RatingRepostitory;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.bookingRepo) bookingRepo: BookingRepository,
		@inject(TYPES.userRepo) userRepo: UserRepository,
		@inject(TYPES.ratingRepo) ratingRepo: RatingRepostitory,
	) {
		this.errorHandler = errorHandler;
		this.bookingRepo = bookingRepo;
		this.userRepo = userRepo;
		this.ratingRepo = ratingRepo;
	}

	private async _getAllBookingsAndTheirPayments() {
		try {
			const allBookings = await this.bookingRepo.getAll();
			return allBookings || [];
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Ringkasan Bisnis (Untuk SUPERADMIN)
	 * Provides a high-level overview of bookings, cancellations, and revenue within a date range.
	 * @param startDate - The start date for the report.
	 * @param endDate - The end date for the report.
	 * @returns A summary object containing total bookings, confirmed bookings, canceled bookings,
	 * total revenue, and total refunds, or `undefined` on error.
	 */
	async getOverallBusinessSummary(startDate: Date, endDate: Date) {
		try {
			const allBookings = await this._getAllBookingsAndTheirPayments();

			if (allBookings === undefined) {
				return undefined;
			}
			const filteredBookings = allBookings.filter((booking) => {
				const bookingDate = new Date(booking.created_at);
				return bookingDate >= startDate && bookingDate <= endDate;
			});

			const totalBookings = filteredBookings.length;
			let confirmedBookings = 0;
			let canceledBookings = 0;
			let totalRevenue = 0;
			let totalRefunds = 0;

			for (const booking of filteredBookings) {
				if (
					booking.status === Booking_Status.CONFIRMED ||
					booking.status === Booking_Status.COMPLETE
				) {
					confirmedBookings++;
				}
				if (booking.status === Booking_Status.CANCELED) {
					canceledBookings++;
				}
				const paidPayments = booking.Payments.filter(
					(payment) => payment.payment_status === Payment_Status.PAID,
				);
				totalRevenue += paidPayments.reduce(
					(sum, payment) => sum + payment.total_amount.toNumber(),
					0,
				);
				const processedRefunds = booking.Refunds.filter(
					(refund) =>
						refund.status === Refund_Status.APPROVED ||
						refund.status === Refund_Status.COMPLETED,
				);
				totalRefunds += processedRefunds.reduce(
					(sum, refund) => sum + refund.refund_amount.toNumber(),
					0,
				);
			}

			const netRevenue = totalRevenue - totalRefunds;

			return {
				totalBookings,
				confirmedBookings,
				canceledBookings,
				totalRevenue,
				totalRefunds,
				netRevenue,
			};
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Kinerja Keuangan Agregat (Untuk SUPERADMIN & ADMIN_FINANCE)
	 * Provides detailed financial performance metrics within a date range.
	 * @param startDate - The start date for the report.
	 * @param endDate - The end date for the report.
	 * @returns An object containing total paid amount, total refunded amount,
	 * and a breakdown of payments by method, or `undefined` on error.
	 */
	async getFinancialSummary(startDate: Date, endDate: Date) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();
			if (bookings === undefined) {
				return undefined;
			}

			let totalPaidAmount = 0;
			let totalRefundedAmount = 0;
			const paymentsByMethod: { [key: string]: number } = {};
			const promoImpact: {
				[key: string]: { totalDiscount: number; usageCount: number };
			} = {};
			for (const booking of bookings) {
				for (const payment of booking.Payments) {
					const paymentDate = new Date(
						payment.payment_date || payment.created_at,
					);
					if (paymentDate >= startDate && paymentDate <= endDate) {
						if (payment.payment_status === Payment_Status.PAID) {
							totalPaidAmount += payment.total_amount.toNumber();
							paymentsByMethod[payment.payment_method] =
								(paymentsByMethod[payment.payment_method] || 0) +
								payment.total_amount.toNumber();
						}
					}
				}
				for (const refund of booking.Refunds) {
					const refundApprovalDate = new Date(
						refund.approval_date || refund.created_at,
					);
					if (
						refundApprovalDate >= startDate &&
						refundApprovalDate <= endDate
					) {
						if (
							refund.status === Refund_Status.APPROVED ||
							refund.status === Refund_Status.COMPLETED
						) {
							totalRefundedAmount += refund.refund_amount.toNumber();
						}
					}
				}
				if (booking.promos) {
					const promoCode = booking.promos.code;
					const discountValue = booking.promos.discount_value;
					if (!promoImpact[promoCode]) {
						promoImpact[promoCode] = { totalDiscount: 0, usageCount: 0 };
					}
					promoImpact[promoCode].totalDiscount += discountValue;
					promoImpact[promoCode].usageCount++;
				}
			}

			return {
				totalPaidAmount,
				totalRefundedAmount,
				netRevenue: totalPaidAmount - totalRefundedAmount,
				paymentsByMethod,
				promoImpact,
			};
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Status Pemesanan (Untuk ADMIN_OPERATIONAL)
	 * Retrieves a list of bookings filtered by their current status and an optional date range.
	 * @param status - The booking status to filter by (e.g., Booking_Status.PENDING).
	 * @param startDate - Optional start date for filtering bookings.
	 * @param endDate - Optional end date for filtering bookings.
	 * @returns A list of bookings matching the criteria, or `undefined` on error.
	 */
	async getOperationalBookingStatus(
		status?: Booking_Status,
		startDate?: Date,
		endDate?: Date,
	) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();
			if (!bookings) return undefined;

			const filteredBookings = bookings.filter((booking) => {
				const statusMatch = !status || booking.status === status;
				const dateMatch =
					!startDate || !endDate
						? true
						: new Date(booking.created_at) >= startDate &&
							new Date(booking.created_at) <= endDate;

				return statusMatch && dateMatch;
			});

			return filteredBookings;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getTravelPackagePopularityReport(startDate: Date, endDate: Date) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();
			if (bookings === undefined) {
				return undefined;
			}

			const packagePopularity: {
				[packageId: string]: {
					name: string;
					bookingCount: number;
					totalRevenue: number;
				};
			} = {};

			const filteredBookings = bookings.filter((booking) => {
				const bookingDate = new Date(booking.created_at);
				return bookingDate >= startDate && bookingDate <= endDate;
			});

			for (const booking of filteredBookings) {
				if (booking.travel_package) {
					const packageId = booking.travel_package.id;
					const packageName = booking.travel_package.name;

					if (!packagePopularity[packageId]) {
						packagePopularity[packageId] = {
							name: packageName,
							bookingCount: 0,
							totalRevenue: 0,
						};
					}

					packagePopularity[packageId].bookingCount++;

					if (
						booking.status === Booking_Status.CONFIRMED ||
						booking.status === Booking_Status.COMPLETE
					) {
						const paidPayments = booking.Payments.filter(
							(payment) => payment.payment_status === Payment_Status.PAID,
						);
						packagePopularity[packageId].totalRevenue += paidPayments.reduce(
							(sum, payment) => sum + payment.total_amount.toNumber(),
							0,
						);
					}
				}
			}

			return packagePopularity;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Permintaan Reschedule (Untuk ADMIN_OPERATIONAL)
	 * Retrieves all reschedule requests, optionally filtered by their status and date range.
	 * @param status - Optional reschedule status to filter by (e.g., RescheduleStatus.PENDING).
	 * @param startDate - Optional start date for the original booking or reschedule request date.
	 * @param endDate - Optional end date for the original booking or reschedule request date.
	 * @returns A list of reschedule requests, or `undefined` on error.
	 */
	async getRescheduleRequestsReport(
		status?: RescheduleStatus,
		startDate?: Date,
		endDate?: Date,
	) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();
			if (bookings === undefined) {
				return undefined;
			}
			const allRescheduleRequests = bookings.flatMap((booking) =>
				booking.RescheduleRequests.map((req) => ({ ...req, booking: booking })),
			);
			const filteredRequests = allRescheduleRequests.filter((req) => {
				const requestDate = new Date(req.created_at);
				const withinDateRange =
					(!startDate || requestDate >= startDate) &&
					(!endDate || requestDate <= endDate);
				const matchesStatus = !status || req.status === status;
				return withinDateRange && matchesStatus;
			});
			return filteredRequests;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Transaksi Pembayaran (Untuk ADMIN_FINANCE)
	 * Retrieves all payment transactions, optionally filtered by their status and date range.
	 * @param status - Optional payment status to filter by (e.g., Payment_Status.PAID).
	 * @param startDate - Optional start date for the payment transaction.
	 * @param endDate - Optional end date for the payment transaction.
	 * @returns A list of payment transactions, or `undefined` on error.
	 */
	async getPaymentTransactionsReport(
		status?: Payment_Status,
		startDate?: Date,
		endDate?: Date,
	) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();

			if (bookings === undefined) {
				return undefined;
			}
			const allPayments = bookings.flatMap((booking) =>
				booking.Payments.map((payment) => ({
					...payment,
					bookingId: booking.id,
					userId: booking.user_id,
				})),
			);
			const filteredPayments = allPayments.filter((payment) => {
				const paymentDate = new Date(
					payment.payment_date || payment.created_at,
				);
				const withinDateRange =
					(!startDate || paymentDate >= startDate) &&
					(!endDate || paymentDate <= endDate);
				const matchesStatus = !status || payment.payment_status === status;

				return withinDateRange && matchesStatus;
			});

			return filteredPayments;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Pengembalian Dana (Untuk ADMIN_FINANCE)
	 * Retrieves all refund requests, optionally filtered by their status and date range.
	 * @param status - Optional refund status to filter by (e.g., Refund_Status.PENDING).
	 * @param startDate - Optional start date for the refund request.
	 * @param endDate - Optional end date for the refund request.
	 * @returns A list of refund requests, or `undefined` on error.
	 */
	async getRefundRequestsReport(
		status?: Refund_Status,
		startDate?: Date,
		endDate?: Date,
	) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();
			if (bookings === undefined) {
				return undefined;
			}
			const allRefunds = bookings.flatMap((booking) =>
				booking.Refunds.map((refund) => ({
					...refund,
					bookingId: booking.id,
					userId: booking.user_id,
				})),
			);
			const filteredRefunds = allRefunds.filter((refund) => {
				const requestDate = new Date(refund.request_date);
				const withinDateRange =
					(!startDate || requestDate >= startDate) &&
					(!endDate || requestDate <= endDate);
				const matchesStatus = !status || refund.status === status;
				return withinDateRange && matchesStatus;
			});
			return filteredRefunds;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Pemanfaatan Kendaraan (Untuk ADMIN_OPERATIONAL)
	 * Analyzes vehicle utilization based on booked vehicles within a specified date range.
	 * NOTE: This report relies on the booking data. For a complete vehicle utilization,
	 * you might need a separate VehicleRepository that can fetch all vehicles
	 * regardless of their booking status, and then merge with booking data.
	 * For now, it shows which vehicles were booked.
	 * @param startDate - The start date for the report.
	 * @param endDate - The end date for the report.
	 * @returns An object mapping vehicle IDs to their booking counts and total booked days, or `undefined` on error.
	 */
	async getVehicleUtilizationReport(startDate: Date, endDate: Date) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();
			if (bookings === undefined) {
				return undefined;
			}
			const vehicleUtilization: {
				[vehicleId: string]: {
					name: string;
					bookingCount: number;
					totalBookedDays: number;
				};
			} = {};
			for (const booking of bookings) {
				if (
					booking.status === Booking_Status.CONFIRMED ||
					booking.status === Booking_Status.COMPLETE ||
					booking.status === Booking_Status.REFUND_REQUESTED ||
					booking.status === Booking_Status.REJECTED_REFUND ||
					booking.status === Booking_Status.RESCHEDULE_REQUESTED
				) {
					const bookingStartDate = new Date(booking.start_date);
					const bookingEndDate = booking.end_date
						? new Date(booking.end_date)
						: bookingStartDate;
					const relevantStartDate =
						bookingStartDate > startDate ? bookingStartDate : startDate;
					const relevantEndDate =
						bookingEndDate < endDate ? bookingEndDate : endDate;

					if (relevantStartDate <= relevantEndDate) {
						const bookedDays =
							Math.ceil(
								(relevantEndDate.getTime() - relevantStartDate.getTime()) /
									(1000 * 60 * 60 * 24),
							) + 1;

						for (const bookingVehicle of booking.booking_vehicles) {
							const vehicleId = bookingVehicle.vehicle.id;
							const vehicleName = bookingVehicle.vehicle.name;

							if (!vehicleUtilization[vehicleId]) {
								vehicleUtilization[vehicleId] = {
									name: vehicleName,
									bookingCount: 0,
									totalBookedDays: 0,
								};
							}
							vehicleUtilization[vehicleId].bookingCount++;
							vehicleUtilization[vehicleId].totalBookedDays += bookedDays;
						}
					}
				}
			}

			return vehicleUtilization;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Penggunaan Promo (Untuk ADMIN_FINANCE)
	 * Provides insights into which promotions are being used and their impact on bookings.
	 * @param startDate - The start date for the report.
	 * @param endDate - The end date for the report.
	 * @returns An object containing promo usage statistics, or `undefined` on error.
	 */
	async getPromoUsageReport(startDate: Date, endDate: Date) {
		try {
			const bookings = await this._getAllBookingsAndTheirPayments();
			if (bookings === undefined) {
				return undefined;
			}
			const promoUsage: {
				[promoId: string]: {
					code: string;
					usageCount: number;
					totalDiscountValue: number;
				};
			} = {};
			for (const booking of bookings) {
				if (booking.promos) {
					const promoId = booking.promos.id;
					const promoCode = booking.promos.code;
					const discountValue = booking.promos.discount_value;
					if (!promoUsage[promoId]) {
						promoUsage[promoId] = {
							code: promoCode,
							usageCount: 0,
							totalDiscountValue: 0,
						};
					}
					promoUsage[promoId].usageCount++;
					promoUsage[promoId].totalDiscountValue += discountValue;
				}
			}
			return promoUsage;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getUsersAndDriversReport(role?: Roles) {
		try {
			const users = await this.userRepo.getAll();
			if (!users) {
				return undefined;
			}

			const filteredUsers = role
				? users.filter((user) => user.role === role)
				: users;

			return filteredUsers;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getRatingsReport(ratedType?: RatedEntityType) {
		try {
			const ratings = await this.ratingRepo.getAll();
			if (!ratings) {
				return undefined;
			}
			const filteredRatings = ratedType
				? ratings.filter((rating) => rating.ratedType === ratedType)
				: ratings;
			return filteredRatings;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	/**
	 * Laporan Rata-rata Rating per Entitas (Untuk SUPERADMIN)
	 * Calculates the average rating for each type of entity (e.g., Vehicles, Destinations, Packages).
	 * @returns An object containing average ratings grouped by RatedEntityType, or `undefined` on error.
	 */
	async getAverageRatingsPerEntity() {
		try {
			const allRatings = await this.ratingRepo.getAll();
			if (!allRatings) {
				return undefined;
			}

			const aggregatedRatings: {
				[key in RatedEntityType]?: {
					totalRating: number;
					count: number;
					average: number;
				};
			} = {};

			for (const rating of allRatings) {
				if (!aggregatedRatings[rating.ratedType]) {
					aggregatedRatings[rating.ratedType] = {
						totalRating: 0,
						count: 0,
						average: 0,
					};
				}
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				aggregatedRatings[rating.ratedType]!.totalRating += rating.ratingValue;
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				aggregatedRatings[rating.ratedType]!.count++;
			}

			// Calculate average for each type
			for (const type in aggregatedRatings) {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				const data = aggregatedRatings[type as RatedEntityType]!;
				data.average = data.count > 0 ? data.totalRating / data.count : 0;
			}

			return aggregatedRatings;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getDailyBusinessSummary(startDate: Date, endDate: Date) {
		try {
			const allBookings = await this._getAllBookingsAndTheirPayments();

			if (allBookings === undefined) {
				return undefined;
			}

			const dailyData: {
				[date: string]: {
					date: string;
					totalBookings: number;
					confirmedBookings: number;
					canceledBookings: number;
					totalRevenue: number;
					totalRefunds: number;
					netRevenue: number;
				};
			} = {};
			const currentDay = new Date(startDate);
			currentDay.setUTCHours(0, 0, 0, 0);
			const endDay = new Date(endDate);
			endDay.setUTCHours(23, 59, 59, 999);

			while (currentDay <= endDay) {
				const dateKey = currentDay.toISOString().split("T")[0];
				dailyData[dateKey] = {
					date: dateKey,
					totalBookings: 0,
					confirmedBookings: 0,
					canceledBookings: 0,
					totalRevenue: 0,
					totalRefunds: 0,
					netRevenue: 0,
				};
				currentDay.setDate(currentDay.getDate() + 1);
			}
			for (const booking of allBookings) {
				const bookingDate = new Date(booking.created_at);
				if (bookingDate >= startDate && bookingDate <= endDate) {
					const dateKey = bookingDate.toISOString().split("T")[0];

					if (dailyData[dateKey]) {
						dailyData[dateKey].totalBookings++;

						if (
							booking.status === Booking_Status.CONFIRMED ||
							booking.status === Booking_Status.COMPLETE
						) {
							dailyData[dateKey].confirmedBookings++;
						}
						if (booking.status === Booking_Status.CANCELED) {
							dailyData[dateKey].canceledBookings++;
						}

						const paidPayments = booking.Payments.filter(
							(payment) => payment.payment_status === Payment_Status.PAID,
						);
						dailyData[dateKey].totalRevenue += paidPayments.reduce(
							(sum, payment) => sum + payment.total_amount.toNumber(),
							0,
						);

						const processedRefunds = booking.Refunds.filter(
							(refund) =>
								refund.status === Refund_Status.APPROVED ||
								refund.status === Refund_Status.COMPLETED,
						);
						dailyData[dateKey].totalRefunds += processedRefunds.reduce(
							(sum, refund) => sum + refund.refund_amount.toNumber(),
							0,
						);
						dailyData[dateKey].netRevenue =
							dailyData[dateKey].totalRevenue - dailyData[dateKey].totalRefunds;
					}
				}
			}
			const sortedDailyData = Object.values(dailyData).sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			);

			return sortedDailyData;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
