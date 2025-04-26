import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";
import {
	type CreateVehicle,
	TYPES,
	type UpdateVehicle,
} from "../../infrastructure/entity/types";
import type { VehicleRepository } from "../../infrastructure/repositories/vehicle.repo";

@injectable()
export class VehicleService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private vehicleRepo: VehicleRepository;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.vehicleRepo) vehicleRepo: VehicleRepository,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.vehicleRepo = vehicleRepo;
	}

	async getAll() {
		try {
			const vehicles = await this.vehicleRepo.getAll();
			if (vehicles.length === 0) {
				throw this.response.badRequest("Vehicle is empty !");
			}

			return vehicles;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getOne(id: string) {
		try {
			const vehicle = await this.vehicleRepo.getOne(id);

			if (!vehicle) {
				throw this.response.badRequest("Error while fetching vehicle");
			}

			return vehicle;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateVehicle) {
		try {
			const created_vehicle = await this.vehicleRepo.create(payload);
			if (!created_vehicle) {
				throw this.response.badRequest("Error while creating vehicle");
			}

			return created_vehicle;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateVehicle) {
		try {
			const vehicle = await this.vehicleRepo.getOne(id);

			if (!vehicle) {
				throw this.response.badRequest("Error while retreived vehicle");
			}

			const updated_vehicle = await this.vehicleRepo.update(id, payload);
			if (!updated_vehicle) {
				throw this.response.badRequest("Error while updating data vehicle !");
			}
			return updated_vehicle;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async delete(id: string) {
		try {
			const vehicle = await this.vehicleRepo.getOne(id);
			if (!vehicle) {
				throw this.response.notFound("Vehicle not found !");
			}

			await this.vehicleRepo.update(id, { ...vehicle, status: "DISABLE" });
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
