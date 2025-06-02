import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IBooking_Vehicles } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
	TYPES,
	type CreateBookingVehicle,
	type UpdateBookingVehicle,
} from "../entity/types";

@injectable()
export class BookingVehiclesRepository implements IBooking_Vehicles {
	private errorHandler: ErrorHandler;
	private prisma: PrismaClient;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.errorHandler = errorHandler;
		this.prisma = prisma;
	}

	async getAll() {
		try {
			return await this.prisma.booking_Vehicles.findMany({});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.booking_Vehicles.findUnique({
				where: { id },
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateBookingVehicle[], tx?: Prisma.TransactionClient) {
		try {
			const client = tx || this.prisma;
			return await client.booking_Vehicles.createMany({
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(payload: UpdateBookingVehicle[], tx?: Prisma.TransactionClient) {
		try {
			const client = tx || this.prisma;
			const updatePromises = payload.map((travelPackVehicle) =>
				client.booking_Vehicles.update({
					where: { id: travelPackVehicle.id },
					data: travelPackVehicle,
				}),
			);
			return await Promise.all(updatePromises);
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
