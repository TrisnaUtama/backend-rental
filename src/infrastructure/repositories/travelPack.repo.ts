import "reflect-metadata";
import { injectable, inject } from "inversify";
import {
	TYPES,
	type CreateTravelPackage,
	type UpdateTravelPackage,
} from "./../entity/types";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { ITravelPackages } from "../entity/interfaces";

@injectable()
export class TravelPackageRepository implements ITravelPackages {
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
			return await this.prisma.travel_Packages.findMany({
				include: {
					travel_package_destinations: true,
					pax_options: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.travel_Packages.findUnique({
				where: { id },
				include: {
					travel_package_destinations: true,
					pax_options: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateTravelPackage, tx?: Prisma.TransactionClient) {
		try {
			const client = tx || this.prisma;
			return await client.travel_Packages.create({
				data: payload,
				include: { travel_package_destinations: true },
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(
		id: string,
		payload: UpdateTravelPackage,
		tx?: Prisma.TransactionClient,
	) {
		try {
			const client = tx || this.prisma;
			return await client.travel_Packages.update({
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
