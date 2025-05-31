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
	Travel_Packages_Pax,
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
	travelPaxRepo: Symbol.for("TravelPaxRepository"),
	travelPackageDestinationRepo: Symbol.for(
		"TravelPackageDestinationsRepository",
	),
	promoRepo: Symbol.for("PromoRepository"),
	bookingRepo: Symbol.for("BookingRepository"),
	paymentRepo: Symbol.for("PaymentRepository"),
	storageRepo: Symbol.for("StorageRepository"),
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
export type CreatePax = Omit<
	Travel_Packages_Pax,
	"id" | "created_at" |  "updated_at" | "deleted_at"
>;
export type CreatePaxInput = Omit<
	Travel_Packages_Pax,
	"id" | "created_at" | "travel_package_id" |  "updated_at" | "deleted_at"
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
export type UpdatePax = Partial<Travel_Packages_Pax>;
