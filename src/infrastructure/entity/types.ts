import type {
  OTPs,
  Users,
  Notifications,
  Notification_Broadcast,
  Vehicles,
  Destinations,
  Travel_Packages,
  Travel_Packages_Destinations,
  Promos,
  Bookings,
  Payments,
} from "@prisma/client";

export const TYPES = {
  //utils
  logger: Symbol.for("Logger"),
  prisma: Symbol.for("PrismaClient"),
  hashed_password: Symbol.for("HashService"),
  errorHandler: Symbol.for("ErrorHandler"),
  email: Symbol.for("EmailService"),
  http: Symbol.for("Http"),
  midtrans: Symbol.for("MidtransService"),
  // badRequest: Symbol.for("BadRequest"),
  // notFoundError: Symbol.for("NotFoundError"),
  // unauthorizedError: Symbol.for("UnautorizedError"),
  // forbiddenError: Symbol.for("ForbiddenError"),

  //repo
  userRepo: Symbol.for("UserRepository"),
  otpRepo: Symbol.for("OtpRepository"),
  notificationRepo: Symbol.for("NotificationRepository"),
  broadcastRepo: Symbol.for("BroadcastRepository"),
  vehicleRepo: Symbol.for("VehicleRepository"),
  destinationRepo: Symbol.for("DestinationRepository"),
  travelPackageRepo: Symbol.for("TravelPackageRepository"),
  travelPackageDestinationRepo: Symbol.for(
    "TravelPackageDestinationsRepository"
  ),
  promoRepo: Symbol.for("PromoRepository"),
  bookingRepo: Symbol.for("BookingRepository"),
  paymentRepo: Symbol.for("PaymentRepository"),
  storageRepo: Symbol.for("StorageRepository"),
  //  services
  authService: Symbol.for("AuthService"),
  userService: Symbol.for("UserService"),
  notificationService: Symbol.for("NotificationService"),
  broadcastService: Symbol.for("BroadcastService"),
  vehicleService: Symbol.for("VehicleService"),
  destinationService: Symbol.for("DestinationService"),
  promoService: Symbol.for("PromoService"),
  bookingService: Symbol.for("BookingService"),
  paymentService: Symbol.for("PaymentService"),
  otpService: Symbol.for("OtpService"),
  storageService: Symbol.for("StorageService"),
};
// CREATES //
export type CreateUser = Omit<
  Users,
  | "id"
  | "created_at"
  | "updated_at"
  | "refresh_token"
  | "is_verified"
  | "status"
  | "role"
  | "deleted_at"
  | "year_of_experiences"
>;
export type CreateNotification = Omit<
  Notifications,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;
export type CreateNotificationBroadcast = Omit<Notification_Broadcast, "id">;
export type CreateOTP = Omit<OTPs, "id" | "created_at" | "updated_at">;
export type CreateVehicle = Omit<Vehicles, "id" | "created_at" | "updated_at">;
export type CreateDestination = Omit<
  Destinations,
  "id" | "created_at" | "updated_at"
>;
export type CreateTravelPackage = Omit<
  Travel_Packages,
  "id" | "created_at" | "updated_at" | "status" | "deleted_at"
>;
export type CreateTravelPackageDesination = Omit<
  Travel_Packages_Destinations,
  "id" | "created_at" | "updated_at" | "status" | "deleted_at"
>;
export type CreateTravelPackageDesinationInput = Omit<
  Travel_Packages_Destinations,
  | "id"
  | "travel_package_id"
  | "created_at"
  | "updated_at"
  | "status"
  | "deleted_at"
>;
export type CreatePromo = Omit<
  Promos,
  "id" | "created_at" | "updated_at" | "status"
>;
export type CreateBooking = Omit<
  Bookings,
  "id" | "created_at" | "updated_at" | "status" | "deleted_at"
>;
export type CreatePayment = Omit<
  Payments,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

// UPDATES //
export type UpdateUser = Partial<Users>;
export type UpdateOTP = Partial<OTPs>;
export type UpdateNotification = Partial<Notifications>;
export type UpdateNotificationBroadcast = Partial<Notification_Broadcast>;
export type UpdateVehicle = Partial<Vehicles>;
export type UpdateDestination = Partial<Destinations>;
export type UpdateTravelPackage = Partial<Travel_Packages>;
export type UpdateTravelPackageDestination =
  Partial<Travel_Packages_Destinations>;
export type UpdatePromo = Partial<Promos>;
export type UpdateBooking = Partial<Bookings>;
export type UpdatePayment = Partial<Payments>;
