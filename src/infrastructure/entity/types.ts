import type {
	OTPs,
	Users,
	Notifications,
	Notification_Broadcast,
	Vehicles,
	Destinations,
	Destination_Fasilities,
} from "@prisma/client";

export const TYPES = {
	//utils
	logger: Symbol.for("Logger"),
	prisma: Symbol.for("PrismaClient"),
	hashed_password: Symbol.for("HashService"),
	errorHandler: Symbol.for("ErrorHandler"),
	email: Symbol.for("EmailService"),
	http: Symbol.for("Http"),
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
	facilityRepo: Symbol.for("FacilityRepository"),

	//  services
	authService: Symbol.for("AuthService"),
	userService: Symbol.for("UserService"),
	notificationService: Symbol.for("NotificationService"),
	broadcastService: Symbol.for("BroadcastService"),
	vehicleService: Symbol.for("VehicleService"),
	destinationService: Symbol.for("DestinationService"),
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
	| "year_of_experiences"
>;
export type CreateNotification = Omit<
	Notifications,
	"id" | "created_at" | "updated_at"
>;
export type CreateNotificationBroadcast = Omit<Notification_Broadcast, "id">;
export type CreateOTP = Omit<OTPs, "id" | "created_at" | "updated_at">;
export type CreateVehicle = Omit<Vehicles, "id" | "created_at" | "updated_at">;
export type CreateDestination = Omit<
	Destinations,
	"id" | "created_at" | "updated_at"
>;
export type CreateFacility = Omit<
	Destination_Fasilities,
	"id"  |  "created_at" | "updated_at"
>;

// UPDATES //
export type UpdateUser = Partial<Users>;
export type UpdateOTP = Partial<OTPs>;
export type UpdateNotification = Partial<Notifications>;
export type UpdateNotificationBroadcast = Partial<Notification_Broadcast>;
export type UpdateVehicle = Partial<Vehicles>;
export type UpdateDestination = Partial<Destinations>;
export type UpdateFacility = Partial<Destination_Fasilities>;
