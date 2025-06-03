import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IBookings } from "../entity/interfaces";
import type { PrismaClient } from "@prisma/client";
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
					booking_vehicles: true,
					travel_package: true,
					Payments: true,
					promos: true,
					users: true,
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
					booking_vehicles: true,
					travel_package: true,
					Payments: true,
					promos: true,
					users: true,
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
					booking_vehicles: true,
					travel_package: true,
					Payments: true,
					promos: true,
					users: true,
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
				Booking_Vehicles: {
					none: {
						booking: {
							deleted_at: null,
							OR: [
								{
									start_date: {
										lt: endDate,
									},
									end_date: {
										gt: startDate,
									},
								},
								{
									start_date: {
										lt: endDate,
									},
									end_date: null,
								},
							],
						},
					},
				},
			},
		});
	} catch (error) {
		this.errorHandler.handleRepositoryError(error);
	}
}

	async create(payload: CreateBooking) {
		try {
			return await this.prisma.bookings.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateBooking) {
		try {
			return await this.prisma.bookings.update({
				where: {
					id,
				},
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
