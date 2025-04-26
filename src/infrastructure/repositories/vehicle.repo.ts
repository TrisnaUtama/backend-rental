import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { ILogger, IVehicles } from "../entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import type { ErrorHandler } from "../entity/errors/global.error";
import { type CreateVehicle, TYPES, type UpdateVehicle } from "../entity/types";

@injectable()
export class VehicleRepository implements IVehicles {
	private prisma: PrismaClient;
	private errorHandler: ErrorHandler;

	constructor(
		@inject(TYPES.prisma) prisma: PrismaClient,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
	) {
		this.prisma = prisma;
		this.errorHandler = errorHandler;
	}

	async getAll() {
		try {
			const vehicles = await this.prisma.vehicles.findMany();

			return vehicles;
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			const vehicle = await this.prisma.vehicles.findUnique({
				where: {
					id,
				},
			});

			return vehicle;
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateVehicle) {
		try {
			const create_vehicle = await this.prisma.vehicles.create({
				data: payload,
			});
			return create_vehicle;
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateVehicle) {
		try {
			const updated_vehicle = await this.prisma.vehicles.update({
				where: { id },
				data: payload,
			});
			return updated_vehicle;
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async delete(id: string) {
		try {
			await this.prisma.vehicles.delete({ where: { id } });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
