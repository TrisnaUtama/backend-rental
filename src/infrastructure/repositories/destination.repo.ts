import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { PrismaClient } from "@prisma/client";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { IDestinations } from "../entity/interfaces";
import {
	TYPES,
	type CreateDestination,
	type UpdateDestination,
} from "../entity/types";

@injectable()
export class DestinationRepository implements IDestinations {
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
			return await this.prisma.destinations.findMany();
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.destinations.findUnique({
				where: { id },
				include: {
					travel_package_destinations: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getRecomendedById(ids: string[]) {
		try {
			return await this.prisma.destinations.findMany({
				where: {
					id: {
						in: ids,
					},
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateDestination) {
		try {
			return await this.prisma.destinations.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateDestination) {
		try {
			return await this.prisma.destinations.update({
				where: { id },
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
