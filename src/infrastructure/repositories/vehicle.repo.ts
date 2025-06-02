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
			return await this.prisma.vehicles.findMany();
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.vehicles.findUnique({
				where: {
					id,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateVehicle) {
		try {
			return await this.prisma.vehicles.create({
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getManyByIds(ids: string[]) {
		try {
			return this.prisma.vehicles.findMany({
				where: {
					id: { in: ids },
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateVehicle) {
		try {
			return await this.prisma.vehicles.update({
				where: { id },
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
