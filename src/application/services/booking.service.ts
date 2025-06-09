import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { ErrorHandler } from "../../infrastructure/entity/errors/global.error";
import type { BookingRepository } from "../../infrastructure/repositories/booking.repo";
import {
  TYPES,
  type CreateBooking,
  type UpdateBooking,
} from "../../infrastructure/entity/types";
import type { Http } from "../../infrastructure/utils/response/http.response";
import type { VehicleRepository } from "../../infrastructure/repositories/vehicle.repo";
import type { TravelPackageRepository } from "../../infrastructure/repositories/travelPack.repo";
import type { BookingVehiclesRepository } from "../../infrastructure/repositories/bookingVehicle.repo";
import type { TravelPaxRepository } from "../../infrastructure/repositories/travelPax.repo";
import type { Bookings } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import type { PaymentRepository } from "../../infrastructure/repositories/payment.repo";
import { eachDayOfInterval, format } from "date-fns";

@injectable()
export class BookingService {
  private errorHandler: ErrorHandler;
  private response: Http;
  private bookingRepo: BookingRepository;
  private vehicleRepo: VehicleRepository;
  private travelPackageRepo: TravelPackageRepository;
  private bookingVehicleRepo: BookingVehiclesRepository;
  private travelPaxRepo: TravelPaxRepository;
  private paymentrepo: PaymentRepository;

  constructor(
    @inject(TYPES.errorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.http) response: Http,
    @inject(TYPES.bookingRepo) bookingRepo: BookingRepository,
    @inject(TYPES.vehicleRepo) vehicleRepo: VehicleRepository,
    @inject(TYPES.travelPackageRepo) travelPackageRepo: TravelPackageRepository,
    @inject(TYPES.bookingVehicleRepo)
    bookingVehicleRepo: BookingVehiclesRepository,
    @inject(TYPES.travelPaxRepo) travelPaxRepo: TravelPaxRepository,
    @inject(TYPES.paymentRepo) paymentrepo: PaymentRepository
  ) {
    this.errorHandler = errorHandler;
    this.response = response;
    this.bookingRepo = bookingRepo;
    this.vehicleRepo = vehicleRepo;
    this.travelPackageRepo = travelPackageRepo;
    this.bookingVehicleRepo = bookingVehicleRepo;
    this.travelPaxRepo = travelPaxRepo;
    this.paymentrepo = paymentrepo;
  }

  async getOne(id: string) {
    try {
      const booking = await this.bookingRepo.getOne(id);
      if (!booking)
        throw this.response.badRequest(
          `Error while retreive data booking with id ${id}`
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
          `Error while retreive data booking from user id ${id}`
        );
      return bookings;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async create(
    payload: CreateBooking,
    vehicle_ids?: string[],
    selected_pax_option_id?: string
  ) {
    try {
      const { travel_package_id, start_date, end_date } = payload;

      if (!start_date) {
        throw this.response.badRequest("Start date is required");
      }

      let total_price = new Decimal(0);
      let calculated_end_date: Date | null = end_date ?? null;

      if (vehicle_ids && vehicle_ids.length > 0) {
        if (!end_date) {
          throw this.response.badRequest(
            "End date is required for vehicle bookings"
          );
        }
        const vehicles = await this.vehicleRepo.getManyByIds(vehicle_ids);
        if (vehicles.length !== vehicle_ids?.length) {
          throw this.response.badRequest("One or more vehicles not found");
        }
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (start >= end) {
          throw this.response.badRequest("End date must be after start date");
        }
        const durationInDays =
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        for (const vehicle of vehicles) {
          if (vehicle.status !== "AVAILABLE") {
            throw this.response.badRequest(
              `Vehicle ${vehicle.name} is not available`
            );
          }
          total_price = total_price.plus(
            vehicle.price_per_day.mul(durationInDays)
          );
        }
      }

      if (travel_package_id) {
        const travelPackage = await this.travelPackageRepo.getOne(
          travel_package_id
        );
        if (!travelPackage || !travelPackage.status) {
          throw this.response.badRequest("Travel package not available");
        }
        if (!selected_pax_option_id) {
          throw this.response.badRequest("Selected pax option is required");
        }
        const paxOption = await this.travelPaxRepo.getOne(
          selected_pax_option_id
        );
        if (!paxOption || paxOption.travel_package_id !== travel_package_id) {
          throw this.response.badRequest("Invalid pax option selected");
        }

        const start = new Date(start_date);
        const durationInDays = travelPackage.duration;
        start.setDate(start.getDate() + durationInDays);
        calculated_end_date = start;

        total_price = total_price.plus(paxOption.price);
      }

      const booking = await this.bookingRepo.create({
        ...payload,
        end_date: calculated_end_date,
        total_price,
        pax_option_id: selected_pax_option_id || null,
      });

      if (vehicle_ids && vehicle_ids.length > 0) {
        const relations = vehicle_ids.map((vehicle_id: string) => ({
          booking_id: booking.id,
          vehicle_id,
        }));

        await this.bookingVehicleRepo.create(relations);
      }

      return booking;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async update(id: string, payload: UpdateBooking) {
    try {
      const exist_booking = await this.bookingRepo.getOne(id);
      if (!exist_booking)
        throw this.response.notFound(`Booking with id ${id} not found`);

      if (payload.start_date && payload.end_date) {
        const start = new Date(payload.start_date);
        const end = new Date(payload.end_date);
        if (start >= end) {
          throw this.response.badRequest("End date must be after start date");
        }
      }

      const updated = await this.bookingRepo.update(id, payload);
      if (!updated) {
        throw this.response.badRequest(
          `Failed to update booking with id ${id}`
        );
      }

      return updated;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async findAvailableVehicle(startDate: Date, endDate: Date) {
    try {
      if (!startDate || !endDate) {
        throw this.response.badRequest("Start and end date must be provided");
      }

      if (startDate >= endDate) {
        throw this.response.badRequest("End date must be after start date");
      }

      const availableVehicles = await this.bookingRepo.findAvailableVehicle(
        startDate,
        endDate
      );

      return availableVehicles;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async getUnavailableVehicleDate(
    vehicleId: string,
    excludeBookingId: string
  ): Promise<string[]> {
    try {
      const conflictingBookings =
        await this.bookingRepo.getUnavailableVehicleDate(
          vehicleId,
          excludeBookingId
        );

      const unavailableDatesSet = new Set<string>();

      for (const booking of conflictingBookings) {
        if (booking.start_date && booking.end_date) {
          const datesInRange = eachDayOfInterval({
            start: new Date(booking.start_date),
            end: new Date(booking.end_date),
          });

          for (const date of datesInRange) {
            unavailableDatesSet.add(format(date, "yyyy-MM-dd"));
          }
        }
      }

      return Array.from(unavailableDatesSet);
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }

  async assignVehicleAndConfirm(
    bookingId: string,
    vehicleIds: string[]
  ): Promise<Bookings> {
    try {
      const booking = await this.bookingRepo.getOne(bookingId);
      if (!booking)
        throw this.response.notFound(`Booking with id ${bookingId} not found`);

      if (booking.status !== "SUBMITTED") {
        throw this.response.badRequest(
          "Only submitted bookings can be accepted"
        );
      }

      if (!booking.travel_package_id) {
        throw this.response.badRequest("Booking is not a travel package");
      }

      await this.bookingVehicleRepo.create(
        vehicleIds.map((id) => ({
          booking_id: bookingId,
          vehicle_id: id,
        }))
      );

      const updatedBooking = await this.bookingRepo.update(bookingId, {
        status: "RECEIVED",
      });

      if (!updatedBooking.total_price)
        throw this.errorHandler.handleServiceError("total price still empty");

      await this.paymentrepo.create({
        booking_id: bookingId,
        payment_status: "PENDING",
        payment_date: null,
        payment_method: null,
        expiry_date: null,
        total_amount: updatedBooking.total_price,
      });

      return updatedBooking;
    } catch (error) {
      this.errorHandler.handleServiceError(error);
    }
  }
}
