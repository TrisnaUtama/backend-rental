import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { Prisma, PrismaClient } from "@prisma/client";
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
			return await this.prisma.destinations.findMany({
				include: {
					destination_fasilities: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.destinations.findUnique({ where: { id } });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateDestination, tx?: Prisma.TransactionClient) {
		try {
			const client = tx || this.prisma;
			return await client.destinations.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(
		id: string,
		payload: UpdateDestination,
		tx?: Prisma.TransactionClient,
	) {
		try {
			const client = tx || this.prisma;
			return await client.destinations.update({
				where: { id },
				data: payload,
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}
}
