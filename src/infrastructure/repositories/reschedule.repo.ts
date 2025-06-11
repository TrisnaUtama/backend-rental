import "reflect-metadata";
import { inject, injectable } from "inversify";
import type {  IRescheduleRequest } from "../entity/interfaces";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
    type CreateResheduleRequest,
    TYPES,
    type UpdateRescheduleRequest,
} from "../entity/types";

@injectable()
export class RescheduleRepostitory implements IRescheduleRequest {
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
            return await this.prisma.rescheduleRequest.findMany();
        } catch (error) {
            this.errorHandler.handleRepositoryError(error);
        }
    }

    async getOne(id: string) {
        try {
            return await this.prisma.rescheduleRequest.findUnique({ where: { id } });
        } catch (error) {
            this.errorHandler.handleRepositoryError(error);
        }
    }

    async create(payload: CreateResheduleRequest, tx?: Prisma.TransactionClient) {
    try {
        const client = tx || this.prisma;
        return await client.rescheduleRequest.create({ data: payload });
        
    } catch (error) {
        this.errorHandler.handleRepositoryError(error);
    }
}

    async update(id: string, payload: UpdateRescheduleRequest) {
        try {
            return await this.prisma.rescheduleRequest.update({
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
