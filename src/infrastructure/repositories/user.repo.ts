import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IUser } from "../entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import { TYPES, type CreateUser, type UpdateUser } from "../entity/types";
import type { ErrorHandler } from "../entity/errors/global.error";

@injectable()
export class UserRepository implements IUser {
	private prisma: PrismaClient;
	private error_handler: ErrorHandler;
	constructor(
		@inject(TYPES.errorHandler) error_handler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.prisma = prisma;
		this.error_handler = error_handler;
	}

	async getAll() {
		try {
			return await this.prisma.users.findMany({
				where: {
					role: {
						not: "SUPERADMIN",
					},
				},
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async getOne(idOrEmail: string) {
		try {
			return await this.prisma.users.findFirst({
				where: {
					OR: [{ id: idOrEmail }, { email: idOrEmail }],
				},
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async create(payload: CreateUser) {
		try {
			return await this.prisma.users.create({
				data: payload,
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}

	async update(id: string, data: UpdateUser) {
		try {
			return await this.prisma.users.update({
				where: {
					id: id,
				},
				data: {
					name: data.name,
					email: data.email,
					phone_number: data.phone_number,
					status: data.status,
					refresh_token: data.refresh_token,
					is_verified: data.is_verified,
					year_of_experiences: data.year_of_experiences,
					updated_at: new Date(),
				},
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}
}
