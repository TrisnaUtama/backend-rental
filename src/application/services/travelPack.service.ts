import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { TravelPackagesDestinationsRepository } from "./../../infrastructure/repositories/travelPackDestination.repo";
import type { TravelPackageRepository } from "../../infrastructure/repositories/travelPack.repo";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import {
  type UpdateTravelPackage,
  type CreateTravelPackage,
  TYPES,
  type UpdateTravelPackageDestination,
  type CreateTravelPackageDesinationInput,
  type UpdatePax,
  type CreatePaxInput,
} from "../../infrastructure/entity/types";
import type { PrismaClient } from "@prisma/client";
import type { TravelPaxRepository } from "../../infrastructure/repositories/travelPax.repo";

@injectable()
export class TravelPackageService {
  private travelPackageRepo: TravelPackageRepository;
  private travelPackagesDestinationRepo: TravelPackagesDestinationsRepository;
  private travelPaxRepo: TravelPaxRepository;
  private response: Http;
  private errorHandler: ErrorHandler;
  private prisma: PrismaClient;

  constructor(
    @inject(TYPES.travelPackageRepo) travelPackageRepo: TravelPackageRepository,
    @inject(TYPES.http) response: Http,
    @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.prisma) prisma: PrismaClient,
    @inject(TYPES.travelPaxRepo) travelPaxRepo: TravelPaxRepository,
    @inject(TYPES.travelPackageDestinationRepo)
    travelPackageDestinationRepo: TravelPackagesDestinationsRepository
  ) {
    this.travelPackageRepo = travelPackageRepo;
    this.response = response;
    this.errorHandler = errorHandler;
    this.prisma = prisma;
    this.travelPackagesDestinationRepo = travelPackageDestinationRepo;
    this.travelPaxRepo = travelPaxRepo;
  }

  async getAll() {
    try {
      const travelPacks = await this.travelPackageRepo.getAll();
      if (!travelPacks)
        throw this.response.badRequest(
          "Error while retreiving travel packages !"
        );
      return travelPacks;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async getOne(id: string) {
    try {
      const travel_pack = await this.travelPackageRepo.getOne(id);
      if (!travel_pack) throw this.response.notFound("Travel pack not found !");

      return travel_pack;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async create(
    payload_x: CreateTravelPackage,
    payload_y: CreateTravelPackageDesinationInput[],
    payload_z: CreatePaxInput[]
  ) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const create_travel_pack = await this.travelPackageRepo.create(
          payload_x,
          tx
        );
        if (!create_travel_pack)
          throw this.response.badRequest(
            "Error while creating new travel package"
          );

        const payload_pack_destination = payload_y.map(
          (travel_pack_destination) => ({
            ...travel_pack_destination,
            destination_id: travel_pack_destination.destination_id,
            travel_package_id: create_travel_pack.id,
          })
        );

        const payload_pax = payload_z.map((travel_pax) => ({
          ...travel_pax,
          travel_package_id: create_travel_pack.id,
        }));

        if (!payload_pack_destination)
          throw this.response.badRequest(
            "Error while creating new travel package"
          );

        if (!payload_pax)
          throw this.response.badRequest(
            "Error while creating new travel package"
          );

        await this.travelPackagesDestinationRepo.create(
          payload_pack_destination,
          tx
        );
        await this.travelPaxRepo.create(payload_pax, tx);
        return create_travel_pack;
      });
      return result;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async update(
    id: string,
    payload_x: UpdateTravelPackage,
    payload_y: UpdateTravelPackageDestination[],
    payload_z: UpdatePax[]
  ) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const update_travel_package = await this.travelPackageRepo.update(
          id,
          payload_x,
          tx
        );
        if (!update_travel_package)
          throw this.response.badRequest(
            `Error while updating travel package with id ${id}`
          );

        const updated_travel_pckage_destination =
          await this.travelPackagesDestinationRepo.update(payload_y, tx);
        const update_travel_pax = await this.travelPaxRepo.update(
          payload_z,
          tx
        );
        if (!updated_travel_pckage_destination) {
          throw new Error("Error while updating travel pacakage destination!");
        }
        if (!update_travel_pax) {
          throw new Error("Error while updating travel pax!");
        }

        return updated_travel_pckage_destination;
      });
      return result;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async delete(id: string) {
    try {
      const travel_pack = await this.travelPackageRepo.getOne(id);
      if (!travel_pack)
        throw this.response.notFound("Travel package is not found !");

      return await this.travelPackageRepo.update(id, {
        ...travel_pack,
        status: false,
      });
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }
}
