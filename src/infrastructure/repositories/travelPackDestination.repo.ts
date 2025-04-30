import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { ITravelPackagesDestinations } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
	TYPES,
	type CreateTravelPackageDesination,
	type UpdateTravelPackageDestination,
} from "../entity/types";

@injectable()
export class TravelPackagesDestinationsRepository
	implements ITravelPackagesDestinations
{
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
			return await this.prisma.travel_Packages_Destinations.findMany({});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.travel_Packages_Destinations.findUnique({
				where: { id },
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(
		payload: CreateTravelPackageDesination[],
		tx?: Prisma.TransactionClient,
	) {
		try {
			const client = tx || this.prisma;
			return await client.travel_Packages_Destinations.createMany({
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(
		payload: UpdateTravelPackageDestination[],
		tx?: Prisma.TransactionClient,
	) {
		try {
			const client = tx || this.prisma;
			const updatePromises = payload.map((travelPackDestination) =>
				client.travel_Packages_Destinations.update({
					where: { id: travelPackDestination.id },
					data: travelPackDestination,
				}),
			);
			return await Promise.all(updatePromises);
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
