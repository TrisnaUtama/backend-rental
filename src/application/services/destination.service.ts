import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { DestinationRepository } from "../../infrastructure/repositories/destination.repo";
import {
	type CreateDestination,
	type UpdateDestination,
	TYPES,
} from "../../infrastructure/entity/types";
import type { PrismaClient } from "@prisma/client";

@injectable()
export class DestinationService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private destinationRepo: DestinationRepository;

	constructor(
		@inject(TYPES.destinationRepo) destinationRepo: DestinationRepository,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.prisma) prisma: PrismaClient,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.destinationRepo = destinationRepo;
	}

	async getAll() {
		try {
			const destinations = await this.destinationRepo.getAll();
			if (!destinations)
				throw this.response.badRequest("Error while retreived destinations !");
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

	async getRecomendation(id: string[]) {
		try {
			const recomendationDestination =
				await this.destinationRepo.getRecomendedById(id);
			return recomendationDestination;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateDestination) {
		try {
			const new_destination = await this.destinationRepo.create(payload);
			if (!new_destination)
				throw this.response.badRequest("Error while creating new destination");
			return new_destination;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateDestination) {
		try {
			const existing_destination = await this.destinationRepo.getOne(id);
			if (!existing_destination)
				throw this.response.notFound("Destination not exists");
			const updated_destination = await this.destinationRepo.update(
				id,
				payload,
			);
			if (!updated_destination)
				throw this.response.badRequest("Failed Updating Destination");

			return updated_destination;
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
