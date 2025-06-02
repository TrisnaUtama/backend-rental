import { Accommodations } from "./../../../node_modules/.prisma/client/index.d";
import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IAccomodation } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { PrismaClient } from "@prisma/client";
import {
	type CreateAccomodation,
	TYPES,
	type UpdateAccomodation,
} from "../entity/types";

@injectable()
export class AccomodationRepostitory implements IAccomodation {
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
			return await this.prisma.accommodations.findMany();
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async getOne(id: string) {
		try {
			return await this.prisma.accommodations.findUnique({ where: { id } });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateAccomodation) {
		try {
			return await this.prisma.accommodations.create({ data: payload });
		} catch (error) {
			this.errorHandler.handleRepositoryError(error);
		}
	}

	async update(id: string, payload: UpdateAccomodation) {
		try {
			return await this.prisma.accommodations.update({
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
