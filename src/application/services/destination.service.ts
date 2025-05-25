import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { DestinationRepository } from "../../infrastructure/repositories/destination.repo";
import {
	type CreateDestination,
	type UpdateDestination,
	type CreateFacility,
	TYPES,
	type UpdateFacility,
} from "../../infrastructure/entity/types";
import type { FacilityRepository } from "../../infrastructure/repositories/facility.repo";
import type { PrismaClient } from "@prisma/client";

@injectable()
export class DestinationService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private destinationRepo: DestinationRepository;
	private facilityRepo: FacilityRepository;
	private prisma: PrismaClient;

	constructor(
		@inject(TYPES.destinationRepo) destinationRepo: DestinationRepository,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.facilityRepo) facilityRepo: FacilityRepository,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.destinationRepo = destinationRepo;
		this.facilityRepo = facilityRepo;
		this.prisma = prisma;
	}

	async getAll() {
		try {
			const destinations = await this.destinationRepo.getAll();
			if (!destinations)
				throw this.response.badRequest("Error while retreived destinations !");
			if (destinations.length === 0)
				throw this.response.notFound("Destinations is empty !");

			return destinations;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const destination = await this.destinationRepo.getOne(id);
			if (!destination) throw this.response.notFound("Destinations is empty !");

			return destination;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload_x: CreateDestination, payload_y: CreateFacility[]) {
		try {
			const result = await this.prisma.$transaction(async (tx) => {
				const destination = await this.destinationRepo.create(payload_x, tx);
				if (!destination) {
					throw this.response.badRequest("Error while creating destination!");
				}

				const payload_facilities = payload_y.map((facility) => ({
					...facility,
					destination_id: destination.id,
				}));

				await this.facilityRepo.createMany(payload_facilities, tx);

				return destination;
			});

			return result;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(
		id: string,
		payload_x: UpdateDestination,
		payload_y: UpdateFacility[],
	) {
		try {
			const result = await this.prisma.$transaction(async (tx) => {
				const updatedDestination = await this.destinationRepo.update(
					id,
					payload_x,
					tx,
				);
				if (!updatedDestination)
					throw new Error("Error while updating destination!");

				const updated_acilities = await this.facilityRepo.update(payload_y, tx);
				if (!updated_acilities) {
					throw new Error("Error while updating facilities!");
				}

				return updatedDestination;
			});
			return result;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async delete(id: string) {
		try {
			const destination = await this.destinationRepo.getOne(id);
			if (!destination) throw this.response.notFound("Destination not found !");

			await this.destinationRepo.update(id, { ...destination, status: false });
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
