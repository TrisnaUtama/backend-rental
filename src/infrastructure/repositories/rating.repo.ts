import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IRating } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { PrismaClient } from "@prisma/client";
import { type CreateRating, type UpdateRating, TYPES } from "../entity/types";

@injectable()
export class RatingRepostitory implements IRating {
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
			return await this.prisma.rating.findMany({
				include: {
					user: true,
				},
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.rating.findUnique({ where: { id } });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getByTragetId(target_id: string) {
		try {
			return await this.prisma.rating.findMany({
				where: { targetId: target_id },
			});
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateRating) {
		try {
			return await this.prisma.rating.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateRating) {
		try {
			return await this.prisma.rating.update({
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
