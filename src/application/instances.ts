import { BroadcastService } from "./services/broadcast.service";
import { BroadcastRepository } from "./../infrastructure/repositories/boradcast.repo";
import { Container } from "inversify";
import { TYPES } from "../infrastructure/entity/types";
import { Logger } from "../infrastructure/entity/logger";
import { UserRepository } from "../infrastructure/repositories/user.repo";
import { AuthService } from "./services/auth.service";
import type {
	IAccomodation,
	IBookings,
	IDestinations,
	ILogger,
	INotification,
	INotificationBroadcast,
	IOTP,
	IPayments,
	IPromos,
	IRating,
	IStorage,
	ITravelPackages,
	ITravelPackagesDestinations,
	IBooking_Vehicles,
	ITravelPax,
	IUser,
	IVehicles,
	ITravel_Itineraries,
	IRescheduleRequest,
	IRefund,
} from "../infrastructure/entity/interfaces";
import type { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "../infrastructure/entity/errors/global.error";
import { HashService } from "../infrastructure/utils/hashed_password";
import { OtpRepository } from "../infrastructure/repositories/otp.repo";
import { EmailService } from "../infrastructure/entity/email";
import { UserService } from "./services/user.service";
import { NotificationService } from "./services/notification.service";
import { NotificationRepository } from "../infrastructure/repositories/notification.repo";
import { Http } from "../infrastructure/utils/response/http.response";
import { prisma } from "../infrastructure/utils/prisma";
import { VehicleService } from "./services/vehicle.service";
import { VehicleRepository } from "../infrastructure/repositories/vehicle.repo";
import { DestinationService } from "./services/destination.service";
import { DestinationRepository } from "../infrastructure/repositories/destination.repo";
import { TravelPackageRepository } from "../infrastructure/repositories/travelPack.repo";
import { TravelPackageService } from "./services/travelPack.service";
import { TravelPackagesDestinationsRepository } from "../infrastructure/repositories/travelPackDestination.repo";
import { PromoRepository } from "../infrastructure/repositories/promo.repo";
import { PromoService } from "./services/promo.service";
import { BookingRepository } from "../infrastructure/repositories/booking.repo";
import { PaymentRepository } from "../infrastructure/repositories/payment.repo";
import { BookingService } from "./services/booking.service";
import { PaymentService } from "./services/payment.service";
import { MidtransService } from "../infrastructure/entity/midtrans";
import { OtpService } from "./services/otp.service";
import { StorageRepository } from "../infrastructure/repositories/storage.repo";
import { StorageService } from "./services/storage.service";
import { TravelPaxRepository } from "../infrastructure/repositories/travelPax.repo";
import { RatingRepostitory } from "../infrastructure/repositories/rating.repo";
import { RatingService } from "./services/rating.service";
import { AccomodationRepostitory } from "../infrastructure/repositories/accomodation.repo";
import { AccomodationService } from "./services/accomodation.service";
import { BookingVehiclesRepository } from "../infrastructure/repositories/bookingVehicle.repo";
import { TravelItinerariesRepository } from "../infrastructure/repositories/travelItineraries.repo";
import { HttpClient } from "../infrastructure/utils/response/http-client";
import { RecomendationService } from "./services/recomendation.service";
import { RescheduleRepostitory } from "../infrastructure/repositories/reschedule.repo";
import { RescheduleService } from "./services/reschedule.service";
import { RefundRepository } from "../infrastructure/repositories/refund.repo";
import { RefundService } from "./services/refund.service";
import { ReportService } from "./services/report.service";

export const container = new Container();

// injector
container.bind<ILogger>(TYPES.logger).to(Logger);
container.bind<PrismaClient>(TYPES.prisma).toConstantValue(prisma);
container.bind<IUser>(TYPES.userRepo).to(UserRepository);
container.bind<IOTP>(TYPES.otpRepo).to(OtpRepository);
container.bind<Http>(TYPES.http).to(Http);
container.bind<MidtransService>(TYPES.midtrans).to(MidtransService);
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
container.bind<ITravelPax>(TYPES.travelPaxRepo).to(TravelPaxRepository);
container
	.bind<IAccomodation>(TYPES.accomodationRepo)
	.to(AccomodationRepostitory);
container
	.bind<ITravelPackagesDestinations>(TYPES.travelPackageDestinationRepo)
	.to(TravelPackagesDestinationsRepository);
container
	.bind<IBooking_Vehicles>(TYPES.bookingVehicleRepo)
	.to(BookingVehiclesRepository);
container
	.bind<ITravel_Itineraries>(TYPES.travelItinerariesRepo)
	.to(TravelItinerariesRepository);
container.bind<IPromos>(TYPES.promoRepo).to(PromoRepository);
container
	.bind<IRescheduleRequest>(TYPES.rescheduleRepo)
	.to(RescheduleRepostitory);
container.bind<IRefund>(TYPES.refundRepo).to(RefundRepository);
container.bind<IRating>(TYPES.ratingRepo).to(RatingRepostitory);
container.bind<IBookings>(TYPES.bookingRepo).to(BookingRepository);
container.bind<IPayments>(TYPES.paymentRepo).to(PaymentRepository);
container.bind<IStorage>(TYPES.storageRepo).to(StorageRepository);
container.bind<ErrorHandler>(TYPES.errorHandler).to(ErrorHandler);
container.bind<HashService>(TYPES.hashed_password).to(HashService);
container.bind<EmailService>(TYPES.email).to(EmailService);
container.bind<HttpClient>(TYPES.httpClient).to(HttpClient);

// services
container.bind<AuthService>(AuthService).toSelf();
container.bind<UserService>(UserService).toSelf();
container.bind<NotificationService>(NotificationService).toSelf();
container.bind<BroadcastService>(BroadcastService).toSelf();
container.bind<VehicleService>(VehicleService).toSelf();
container.bind<DestinationService>(DestinationService).toSelf();
container.bind<TravelPackageService>(TravelPackageService).toSelf();
container.bind<PromoService>(PromoService).toSelf();
container.bind<RatingService>(RatingService).toSelf();
container.bind<AccomodationService>(AccomodationService).toSelf();
container.bind<BookingService>(BookingService).toSelf();
container.bind<PaymentService>(PaymentService).toSelf();
container.bind<OtpService>(OtpService).toSelf();
container.bind<StorageService>(StorageService).toSelf();
container.bind<Http>(Http).toSelf();
container.bind<MidtransService>(MidtransService).toSelf();
container.bind<Logger>(Logger).toSelf();
container.bind<RecomendationService>(RecomendationService).toSelf();
container.bind<RescheduleService>(RescheduleService).toSelf();
container.bind<RefundService>(RefundService).toSelf();
container.bind<ReportService>(ReportService).toSelf();
container.bind<EmailService>(EmailService).toSelf();

//instance

export const response = container.get<Http>(Http);
export const logger = container.get<Logger>(Logger);
export const midtrans = container.get<MidtransService>(MidtransService);
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
export const ratingServie = container.get<RatingService>(RatingService);
export const bookingService = container.get<BookingService>(BookingService);
export const paymentService = container.get<PaymentService>(PaymentService);
export const otpService = container.get<OtpService>(OtpService);
export const storageService = container.get<StorageService>(StorageService);
export const accomodationService =
	container.get<AccomodationService>(AccomodationService);
export const recomendationService =
	container.get<RecomendationService>(RecomendationService);
export const rescheduleService =
	container.get<RescheduleService>(RescheduleService);
export const refundService = container.get<RefundService>(RefundService);
export const reportService = container.get<ReportService>(ReportService);
export const emailService = container.get<EmailService>(EmailService);
export const broadcastService =
	container.get<BroadcastService>(BroadcastService);
