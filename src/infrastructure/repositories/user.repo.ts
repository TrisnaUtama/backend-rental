import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IUser } from "../entity/interfaces";
import { Roles, type PrismaClient } from "@prisma/client";
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
						not: Roles.SUPERADMIN,
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

	async getRefreshToken(token:string){
		try {
			return await this.prisma.users.findFirst({
				where: {
					refresh_token: token
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

	async update(id: string, payload: UpdateUser) {
		try {
			return await this.prisma.users.update({
				where: {
					id: id,
				},
				data: payload,
			});
		} catch (error) {
			this.error_handler.handleRepositoryError(error);
		}
	}
}
