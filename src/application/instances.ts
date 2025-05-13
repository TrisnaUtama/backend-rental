import { BroadcastService } from "./services/broadcast.services";
import { BroadcastRepository } from "./../infrastructure/repositories/boradcast.repo";
import { Container } from "inversify";
import { TYPES } from "../infrastructure/entity/types";
import { Logger } from "../infrastructure/entity/logger";
import { UserRepository } from "../infrastructure/repositories/user.repo";
import { AuthService } from "./services/auth.services";
import type {
	IBookings,
	IDestinations,
	IFacilities,
	ILogger,
	INotification,
	INotificationBroadcast,
	IOTP,
	IPayments,
	IPromos,
	ITravelPackages,
	ITravelPackagesDestinations,
	IUser,
	IVehicles,
} from "../infrastructure/entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "../infrastructure/entity/errors/global.error";
import { HashService } from "../infrastructure/utils/hashed_password";
import { OtpRepository } from "../infrastructure/repositories/otp.repo";
import { EmailService } from "../infrastructure/entity/email";
import { UserService } from "./services/user.services";
import { NotificationService } from "./services/notification.services";
import { NotificationRepository } from "../infrastructure/repositories/notification.repo";
import { Http } from "../infrastructure/utils/response/http.response";
import { prisma } from "../infrastructure/utils/prisma";
import { VehicleService } from "./services/vehicle.services";
import { VehicleRepository } from "../infrastructure/repositories/vehicle.repo";
import { DestinationService } from "./services/destination.services";
import { DestinationRepository } from "../infrastructure/repositories/destination.repo";
import { FacilityRepository } from "../infrastructure/repositories/facility.repo";
import { TravelPackageRepository } from "../infrastructure/repositories/travelPack.repo";
import { TravelPackageService } from "./services/travelPack.services";
import { TravelPackagesDestinationsRepository } from "../infrastructure/repositories/travelPackDestination.repo";
import { PromoRepository } from "../infrastructure/repositories/promo.repo";
import { PromoService } from "./services/promo.services";
import { BookingRepository } from "../infrastructure/repositories/booking.repo";
import { PaymentRepository } from "../infrastructure/repositories/payment.repo";
import { BookingService } from "./services/booking.services";
import { PaymentService } from "./services/payment.services";

export const container = new Container();

// injector
container.bind<ILogger>(TYPES.logger).to(Logger);
container.bind<PrismaClient>(TYPES.prisma).toConstantValue(prisma);
container.bind<IUser>(TYPES.userRepo).to(UserRepository);
container.bind<IOTP>(TYPES.otpRepo).to(OtpRepository);
container.bind<Http>(TYPES.http).to(Http);
container
	.bind<INotification>(TYPES.notificationRepo)
	.to(NotificationRepository);
container
	.bind<INotificationBroadcast>(TYPES.broadcastRepo)
	.to(BroadcastRepository);
container.bind<IVehicles>(TYPES.vehicleRepo).to(VehicleRepository);
container.bind<IDestinations>(TYPES.destinationRepo).to(DestinationRepository);
container
	.bind<ITravelPackages>(TYPES.travelPackageRepo)
	.to(TravelPackageRepository);
container
	.bind<ITravelPackagesDestinations>(TYPES.travelPackageDestinationRepo)
	.to(TravelPackagesDestinationsRepository);
container.bind<IPromos>(TYPES.promoRepo).to(PromoRepository);
container.bind<IBookings>(TYPES.bookingRepo).to(BookingRepository);
container.bind<IPayments>(TYPES.paymentRepo).to(PaymentRepository);
container.bind<IFacilities>(TYPES.facilityRepo).to(FacilityRepository);
container.bind<ErrorHandler>(TYPES.errorHandler).to(ErrorHandler);
container.bind<HashService>(TYPES.hashed_password).to(HashService);
container.bind<EmailService>(TYPES.email).to(EmailService);

// services
container.bind<AuthService>(AuthService).toSelf();
container.bind<UserService>(UserService).toSelf();
container.bind<NotificationService>(NotificationService).toSelf();
container.bind<BroadcastService>(BroadcastService).toSelf();
container.bind<VehicleService>(VehicleService).toSelf();
container.bind<DestinationService>(DestinationService).toSelf();
container.bind<TravelPackageService>(TravelPackageService).toSelf();
container.bind<PromoService>(PromoService).toSelf();
container.bind<BookingService>(BookingService).toSelf();
container.bind<PaymentService>(PaymentService).toSelf();
container.bind<Http>(Http).toSelf();

//instance
export const response = container.get<Http>(Http);
export const authService = container.get<AuthService>(AuthService);
export const userService = container.get<UserService>(UserService);
export const notificationService =
	container.get<NotificationService>(NotificationService);
export const braodcastService =
	container.get<BroadcastService>(BroadcastService);
export const vehicleService = container.get<VehicleService>(VehicleService);
export const destinationService =
	container.get<DestinationService>(DestinationService);
export const travelPackageService =
	container.get<TravelPackageService>(TravelPackageService);
export const promoService = container.get<PromoService>(PromoService);
export const bookingService = container.get<BookingService>(BookingService);
export const paymentService = container.get<PaymentService>(PaymentService);
