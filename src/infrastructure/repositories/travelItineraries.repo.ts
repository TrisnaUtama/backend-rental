import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { ITravel_Itineraries } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
	TYPES,
	type CreateTravelItineraries,
	type UpdateTravelItineraries,
} from "../entity/types";

@injectable()
export class TravelItinerariesRepository implements ITravel_Itineraries {
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
			return await this.prisma.travel_Itineraries.findMany({});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.travel_Itineraries.findUnique({
				where: { id },
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(
		payload: CreateTravelItineraries[],
		tx?: Prisma.TransactionClient,
	) {
		try {
			const client = tx || this.prisma;
			return await client.travel_Itineraries.createMany({
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(
		payload: UpdateTravelItineraries[],
		tx?: Prisma.TransactionClient,
	) {
		try {
			const client = tx || this.prisma;
			const updatePromises = payload.map((travelIteneraries) =>
				client.travel_Itineraries.update({
					where: { id: travelIteneraries.id },
					data: travelIteneraries,
				}),
			);
			return await Promise.all(updatePromises);
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
