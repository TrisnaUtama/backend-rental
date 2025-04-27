import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IFacilities } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
	TYPES,
	type CreateFacility,
	type UpdateFacility,
} from "../entity/types";

@injectable()
export class FacilityRepository implements IFacilities {
	private errorHandler: ErrorHandler;
	private prisma: PrismaClient;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.errorHandler = errorHandler;
		this.prisma = prisma;
	}

	async getAllByIdDestination(id: string) {
		try {
			return await this.prisma.destination_Fasilities.findMany({
				where: {
					destination_id: id,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.destination_Fasilities.findUnique({
				where: { id },
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async createMany(payload: CreateFacility[], tx?: Prisma.TransactionClient) {
		try {
			const client = tx || this.prisma;

			const updatedPayload = payload.map((facility) => ({
				...facility,
				destination_id: facility.destination_id,
			}));

			return await client.destination_Fasilities.createMany({
				data: updatedPayload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(payload: UpdateFacility[], tx?: Prisma.TransactionClient) {
		try {
			const client = tx || this.prisma;
			const updatePromises = payload.map((facility) =>
				client.destination_Fasilities.update({
					where: { id: facility.id },
					data: facility,
				}),
			);
			return await Promise.all(updatePromises);
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
