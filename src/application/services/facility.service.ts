import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { FacilityRepository } from "../../infrastructure/repositories/facility.repo";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { Http } from "../../infrastructure/utils/response/http.response";
import {
	TYPES,
	type CreateFacility,
	type UpdateFacility,
} from "./../../infrastructure/entity/types";

@injectable()
export class FacilityService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private facilityRepo: FacilityRepository;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.facilityRepo) facilityRepo: FacilityRepository,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.facilityRepo = facilityRepo;
	}

	async getOne(id: string) {
		try {
			const facility = await this.facilityRepo.getOne(id);
			if (!facility)
				throw this.response.badRequest("Error while retreived facility");
			return facility;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getDestinationFacility(id: string) {
		try {
			const facilities = await this.facilityRepo.getAllByIdDestination(id);
			if (!facilities)
				throw this.response.badRequest(
					"Error while retreiving facilities from specific destination",
				);

			if (facilities.length === 0)
				throw this.response.notFound("Facilities is empty !");

			return facilities;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateFacility[]) {
		try {
			const update_facilities = await this.facilityRepo.update(payload);
			if (!update_facilities)
				throw this.response.badRequest("Error while updating facility !");

			return update_facilities;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	// async delete(id: string) {
	// 	try {
	// 		const facility = await this.facilityRepo.getOne(id);
	// 		if (!facility) throw this.response.notFound("Facility not found !");

	// 		await this.facilityRepo.update(id, { ...facility, status: false });
	// 	} catch (error) {
	// 		this.errorHandler.handleServiceError(error);
	// 	}
	// }
}
