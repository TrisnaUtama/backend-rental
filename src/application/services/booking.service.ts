import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { BookingRepository } from "../../infrastructure/repositories/booking.repo";
import {
	TYPES,
	type CreateBooking,
	type UpdateBooking,
} from "../../infrastructure/entity/types";
import { Vehicle_status } from ".prisma/client";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { VehicleRepository } from "../../infrastructure/repositories/vehicle.repo";
import type { TravelPackageRepository } from "../../infrastructure/repositories/travelPack.repo";
import { Decimal } from "@prisma/client/runtime/library";

@injectable()
export class BookingService {
	private errorHandler: ErrorHandler;
	private response: Http;
	private bookingRepo: BookingRepository;
	private vehicleRepo: VehicleRepository;
	private travelPackageRepo: TravelPackageRepository;

	constructor(
		@inject(TYPES.errorHandler) errorHandler: ErrorHandler,
		@inject(TYPES.http) response: Http,
		@inject(TYPES.bookingRepo) bookingRepo: BookingRepository,
		@inject(TYPES.vehicleRepo) vehicleRepo: VehicleRepository,
		@inject(TYPES.travelPackageRepo) travelPackageRepo: TravelPackageRepository,
	) {
		this.errorHandler = errorHandler;
		this.response = response;
		this.bookingRepo = bookingRepo;
		this.vehicleRepo = vehicleRepo;
		this.travelPackageRepo = travelPackageRepo;
	}

	async getOne(id: string) {
		try {
			const booking = await this.bookingRepo.getOne(id);
			if (!booking)
				throw this.response.badRequest(
					`Error while retreive data booking with id ${id}`,
				);
			return booking;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getAll() {
		try {
			const bookings = await this.bookingRepo.getAll();
			if (!bookings)
				throw this.response.badRequest("Error while retreive data bookings");
			return bookings;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async getByUserId(id: string) {
		try {
			const bookings = await this.bookingRepo.getByUserId(id);
			if (!bookings)
				throw this.response.badRequest(
					`Error while retreive data booking from user id ${id}`,
				);
			return bookings;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async create(payload: CreateBooking) {
		try {
			const { vehicle_id, travel_package_id, start_date, end_date } = payload;

			if (
				(vehicle_id && travel_package_id) ||
				(!vehicle_id && !travel_package_id)
			) {
				return this.response.badRequest(
					"Must book either a vehicle or a travel package, not both or none.",
				);
			}

			let total_price = 0;

			if (vehicle_id) {
				const vehicleToBook = await this.vehicleRepo.getOne(vehicle_id);

				if (!vehicleToBook) {
					return this.response.badRequest(
						"Cannot book this vehicle: not found",
					);
				}

				if (vehicleToBook.status !== "AVAILABLE") {
					return this.response.badRequest(
						"Cannot book this vehicle: not available",
					);
				}

				if (!start_date || !end_date) {
					return this.response.badRequest(
						"Start date and end date are required for vehicle booking",
					);
				}

				const start = new Date(start_date);
				const end = new Date(end_date);

				if (start >= end) {
					return this.response.badRequest("End date must be after start date");
				}

				const durationInMs = end.getTime() - start.getTime();
				const durationInDays = Math.ceil(
					durationInMs / (1000 * 60 * 60 * 24) + 1,
				);

				total_price = durationInDays * vehicleToBook.price_per_day.toNumber();
			}

			if (travel_package_id) {
				const travelToBook =
					await this.travelPackageRepo.getOne(travel_package_id);

				if (!travelToBook) {
					return this.response.badRequest(
						"Cannot book this travel package: not found",
					);
				}

				if (travelToBook.status !== true) {
					return this.response.badRequest(
						"Cannot book this travel package: not active",
					);
				}
				if (!start_date) {
					return this.response.badRequest(
						"Start date is required for travel package booking",
					);
				}

				const start = new Date(start_date);

				const durationInMs = travelToBook.duration * 60 * 60 * 1000;
				const end = new Date(start.getTime() + durationInMs);

				payload.start_date = start;
				payload.end_date = end;

				total_price = travelToBook.price.toNumber();
			}
			const totalPriceDecimal = new Decimal(total_price);

			const create_booking = await this.bookingRepo.create({
				...payload,
				total_price: totalPriceDecimal,
			});

			return create_booking;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}

	async update(id: string, payload: UpdateBooking) {
		try {
			const exist_booking = await this.bookingRepo.getOne(id);
			if (!exist_booking)
				throw this.response.notFound(`Booking id ${id} not found !`);
			const update_booking = await this.bookingRepo.update(id, payload);
			if (!update_booking)
				throw this.response.badRequest(
					`Error while updating updating data booking with id ${id}`,
				);
			return update_booking;
		} catch (error) {
			this.errorHandler.handleServiceError(error);
		}
	}
}
