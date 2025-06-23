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
