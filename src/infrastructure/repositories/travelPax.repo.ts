import "reflect-metadata";
import { injectable, inject } from "inversify";
import { type CreatePax, TYPES, type UpdatePax } from "./../entity/types";
import type { ErrorHandler } from "../entity/errors/global.error";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { ITravelPax } from "../entity/interfaces";

@injectable()
export class TravelPaxRepository implements ITravelPax {
  private errorHandler: ErrorHandler;
  private prisma: PrismaClient;

  constructor(
    @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.prisma) prisma: PrismaClient
  ) {
    this.errorHandler = errorHandler;
    this.prisma = prisma;
  }

  async getAll() {
    try {
      return await this.prisma.travel_Packages_Pax.findMany();
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
    }
  }

  async getOne(id: string) {
    try {
      return await this.prisma.travel_Packages_Pax.findUnique({
        where: { id },
      });
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
    }
  }

  async create(payload: CreatePax[], tx?: Prisma.TransactionClient) {
    try {
      const client = tx || this.prisma;
      return await client.travel_Packages_Pax.createMany({ data: payload });
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
    }
  }

  async update(payload: UpdatePax[], tx?: Prisma.TransactionClient) {
    try {
      const client = tx || this.prisma;
      const updatePromises = payload.map((travelPax) =>
        client.travel_Packages_Pax.update({
          where: { id: travelPax.id },
          data: travelPax,
        })
      );
      return await Promise.all(updatePromises);
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
    }
  }

  async syncUpdate(
    travel_package_id: string,
    payload: UpdatePax[],
    tx?: Prisma.TransactionClient
  ) {
    try {
      const client = tx || this.prisma;
      const existing = await client.travel_Packages_Pax.findMany({
        where: {
          travel_package_id,
          deleted_at: null,
        },
      });
      const incomingIds = payload.map((d) => d.id).filter(Boolean);
      const toDelete = existing.filter((d) => !incomingIds.includes(d.id));
      const softDeletePromises = toDelete.map((d) =>
        client.travel_Packages_Pax.update({
          where: { id: d.id },
          data: { deleted_at: new Date() },
        })
      );
      const updatePromises = payload.map((d) =>
        client.travel_Packages_Pax.update({
          where: { id: d.id },
          data: {
            pax: d.pax,
            price: d.price
          },
        })
      );

      return await Promise.all([...softDeletePromises, ...updatePromises]);
    } catch (error) {
      this.errorHandler.handleRepositoryError(error);
    }
  }
}
