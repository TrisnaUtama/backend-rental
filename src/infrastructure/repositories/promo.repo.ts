import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IPromos } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { PrismaClient } from "@prisma/client";
import { type CreatePromo, type UpdatePromo, TYPES } from "../entity/types";

@injectable()
export class PromoRepository implements IPromos {
	private prisma: PrismaClient;
	private errorHandler: ErrorHandler;

	constructor(
		@inject(TYPES.prisma) prisma: PrismaClient,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
	) {
		this.errorHandler = errorHandler;
		this.prisma = prisma;
	}

	async getAll() {
		try {
			return await this.prisma.promos.findMany();
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.promos.findUnique({ where: { id } });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreatePromo) {
		try {
			return await this.prisma.promos.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdatePromo) {
		try {
			return await this.prisma.promos.update({
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
