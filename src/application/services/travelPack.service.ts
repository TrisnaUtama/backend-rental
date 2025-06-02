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
	type CreateTravelItinerariesnput,
	type UpdateTravelItineraries,
	type CreateTravelItineraries,
} from "../../infrastructure/entity/types";
import type { PrismaClient } from "@prisma/client";
import type { TravelPaxRepository } from "../../infrastructure/repositories/travelPax.repo";
import type { TravelItinerariesRepository } from "../../infrastructure/repositories/travelItineraries.repo";

@injectable()
export class TravelPackageService {
	private travelPackageRepo: TravelPackageRepository;
	private travelPackagesDestinationRepo: TravelPackagesDestinationsRepository;
	private travelItinerariesRepo: TravelItinerariesRepository;
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
		travelPackageDestinationRepo: TravelPackagesDestinationsRepository,
		@inject(TYPES.travelItinerariesRepo)
		travelItinerariesRepo: TravelItinerariesRepository,
	) {
		this.travelPackageRepo = travelPackageRepo;
		this.response = response;
		this.errorHandler = errorHandler;
		this.prisma = prisma;
		this.travelPackagesDestinationRepo = travelPackageDestinationRepo;
		this.travelPaxRepo = travelPaxRepo;
		this.travelItinerariesRepo = travelItinerariesRepo;
	}

	async getAll() {
		try {
			const travelPacks = await this.travelPackageRepo.getAll();
			if (!travelPacks)
				throw this.response.badRequest(
					"Error while retreiving travel packages !",
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
		payload: CreateTravelPackage,
		payload_dest: CreateTravelPackageDesinationInput[],
		payload_pax: CreatePaxInput[],
		payload_itineraries: CreateTravelItinerariesnput[],
	) {
		try {
			const result = await this.prisma.$transaction(async (tx) => {
				const create_travel_pack = await this.travelPackageRepo.create(
					payload,
					tx,
				);
				if (!create_travel_pack)
					throw this.response.badRequest(
						"Error while creating new travel package",
					);
				const payload_pack_destination = payload_dest.map(
					(travel_pack_destination) => ({
						...travel_pack_destination,
						destination_id: travel_pack_destination.destination_id,
						travel_package_id: create_travel_pack.id,
					}),
				);
				const payload_pax_data = payload_pax.map((travel_pax) => ({
					...travel_pax,
					travel_package_id: create_travel_pack.id,
				}));
				const payload_itineraries_data = payload_itineraries.map(
					(itineraries) => ({
						...itineraries,
						travel_package_id: create_travel_pack.id,
					}),
				);

				if (!payload_pack_destination)
					throw this.response.badRequest(
						"Error while inserting destinations into travel package",
					);
				if (!payload_pax_data)
					throw this.response.badRequest(
						"Error while inserting pax into travel package",
					);
				if (!payload_itineraries_data)
					throw this.response.badRequest(
						"Error while inserting itineraries into travel package",
					);

				await this.travelPackagesDestinationRepo.create(
					payload_pack_destination,
					tx,
				);
				await this.travelPaxRepo.create(payload_pax_data, tx);
				await this.travelItinerariesRepo.create(payload_itineraries_data, tx);
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
		payload_dest: UpdateTravelPackageDestination[],
		payload_pax: UpdatePax[],
		payload_itineraries: UpdateTravelItineraries[],
		duration: number,
	) {
		try {
			const result = await this.prisma.$transaction(async (tx) => {
				const update_travel_package = await this.travelPackageRepo.update(
					id,
					payload_x,
					tx,
				);
				if (!update_travel_package)
					throw this.response.badRequest(
						`Error while updating travel package with id ${id}`,
					);

				const updated_travel_pckage_destination =
					await this.travelPackagesDestinationRepo.update(payload_dest, tx);
				const update_travel_pax = await this.travelPaxRepo.update(
					payload_pax,
					tx,
				);
				const update_travel_itineraries =
					await this.travelItinerariesRepo.syncUpdate(
						id,
						duration,
						payload_itineraries,
						tx,
					);

				if (!updated_travel_pckage_destination) {
					throw new Error("Error while updating travel pacakage destination!");
				}
				if (!update_travel_pax) {
					throw new Error("Error while updating travel pax!");
				}
				if (!update_travel_itineraries) {
					throw new Error("Error while updating Itineraries!");
				}

				return update_travel_package;
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
			const { travel_package_destinations, pax_options, ...rest } = travel_pack;
			return await this.travelPackageRepo.update(id, {
				...rest,
				status: false,
			});
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async addNewItineraries(
	travel_package_id: string,
	newItineraries: CreateTravelItinerariesnput[],
) {
	try {
		const newItinerariesPayload = newItineraries.map((it) => ({
			travel_package_id,
			day_number: it.day_number,
			destination_id: it.destination_id,
			description: it.description || "",
		}));

		if (newItinerariesPayload.length > 0) {
			return await this.travelItinerariesRepo.create(newItinerariesPayload);
		}
	} catch (error) {
		this.errorHandler.handleServiceError(error);
	}
}
}
