import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IBookings } from "../entity/interfaces";
import { Booking_Status, type Prisma, type PrismaClient } from "@prisma/client";
import type { ErrorHandler } from "../entity/errors/global.error";
import { type CreateBooking, TYPES, type UpdateBooking } from "../entity/types";

@injectable()
export class BookingRepository implements IBookings {
	private prisma: PrismaClient;
	private errorHandler: ErrorHandler;

	constructor(
		@inject(TYPES.prisma) prisma: PrismaClient,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
	) {
		this.prisma = prisma;
		this.errorHandler = errorHandler;
	}

	async getOne(id: string) {
		try {
			return await this.prisma.bookings.findUnique({
				where: {
					id,
				},
				include: {
					booking_vehicles: {
						include: {
							vehicle: true,
						},
					},
					travel_package: {
						include: {
							travel_package_destinations: {
								include: {
									destination: true,
								},
							},
						},
					},
					Payments: true,
					promos: true,
					users: true,
					pax_option: true,
					Refunds: true,
					RescheduleRequests: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getByUserId(id: string) {
		try {
			return await this.prisma.bookings.findMany({
				where: {
					user_id: id,
				},
				include: {
					booking_vehicles: {
						include: {
							vehicle: true,
						},
					},
					travel_package: {
						include: {
							travel_package_destinations: {
								include: {
									destination: true,
								},
							},
						},
					},
					Payments: true,
					promos: true,
					users: true,
					pax_option: true,
					Refunds: true,
					RescheduleRequests: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getAll() {
		try {
			return await this.prisma.bookings.findMany({
				include: {
					booking_vehicles: {
						include: {
							vehicle: true,
						},
					},
					travel_package: {
						include: {
							travel_package_destinations: {
								include: {
									destination: true,
								},
							},
						},
					},
					Payments: true,
					promos: true,
					users: true,
					pax_option: true,
					Refunds: true,
					RescheduleRequests: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async findAvailableVehicle(startDate: Date, endDate: Date) {
		try {
			return await this.prisma.vehicles.findMany({
				where: {
					status: "AVAILABLE",
					Booking_Vehicles: {
						none: {
							booking: {
								deleted_at: null,
								status: {
									in: [
										"RECEIVED",
										"CONFIRMED",
										"RESCHEDULE_REQUESTED",
										"RESCHEDULED",
										"RESCHEDULE_REQUESTED",
										"REFUND_REQUESTED",
										"REJECTED_RESHEDULE",
										"REJECTED_REFUND",
										"COMPLETE",
									],
								},
								start_date: {
									lt: endDate,
								},
								end_date: {
									gte: startDate,
								},
							},
						},
					},
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async findUnavailableDatesByVehicleIds(vehicleIds: string[]) {
		try {
			const records = await this.prisma.booking_Vehicles.findMany({
				where: {
					vehicle_id: { in: vehicleIds },
					booking: {
						deleted_at: null,
						status: {
							in: [
								"RECEIVED",
								"CONFIRMED",
								"RESCHEDULE_REQUESTED",
								"RESCHEDULED",
								"REFUND_REQUESTED",
								"REJECTED_RESHEDULE",
								"REJECTED_REFUND",
								"COMPLETE",
							],
						},
					},
				},
				select: {
					booking: {
						select: {
							start_date: true,
							end_date: true,
						},
					},
				},
			});

			return records.map((r) => ({
				start_date: r.booking.start_date,
				end_date: r.booking.end_date,
			}));
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async findBookingsForVehicleIds(vehicleIds: string[]) {
		try {
			const records = await this.prisma.booking_Vehicles.findMany({
				where: {
					vehicle_id: { in: vehicleIds },
					booking: {
						deleted_at: null,
						status: {
							in: [
								"RECEIVED",
								"CONFIRMED",
								"RESCHEDULE_REQUESTED",
								"RESCHEDULED",
								"REFUND_REQUESTED",
								"REJECTED_RESHEDULE",
								"REJECTED_REFUND",
								"COMPLETE",
							],
						},
					},
				},
				select: {
					vehicle_id: true,
					booking: {
						select: {
							start_date: true,
							end_date: true,
						},
					},
				},
			});

			return records.map((r) => ({
				vehicleId: r.vehicle_id,
				startDate: r.booking.start_date,
				endDate: r.booking.end_date,
			}));
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getUnavailableDatesForMultipleVehicles(payload: {
		vehicleIds: string[];
		excludeBookingId: string;
	}) {
		try {
			return await this.prisma.bookings.findMany({
				where: {
					booking_vehicles: {
						some: {
							vehicle_id: {
								in: payload.vehicleIds,
							},
						},
					},
					id: {
						not: payload.excludeBookingId,
					},
					status: {
						in: [
							"RECEIVED",
							"PAYMENT_PENDING",
							"CONFIRMED",
							"RESCHEDULE_REQUESTED",
							"RESCHEDULED",
							"REJECTED_REFUND",
							"COMPLETE",
						],
					},
					deleted_at: null,
				},
				select: {
					start_date: true,
					end_date: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateBooking, tx?: Prisma.TransactionClient) {
		try {
			const client = tx || this.prisma;
			return await client.bookings.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(
		id: string,
		payload: UpdateBooking,
		tx?: Prisma.TransactionClient,
	) {
		try {
			const client = tx || this.prisma;

			return await client.bookings.update({
				where: {
					id,
				},
				data: payload,
				include: {
					RescheduleRequests: true,
					Refunds: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
