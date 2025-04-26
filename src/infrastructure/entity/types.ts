import type {
	OTPs,
	Users,
	Notifications,
	Notification_Broadcast,
} from "@prisma/client";

export const TYPES = {
	//utils
	logger: Symbol.for("Logger"),
	prisma: Symbol.for("PrismaClient"),
	hashed_password: Symbol.for("HashService"),
	errorHandler: Symbol.for("ErrorHandler"),
	email: Symbol.for("EmailService"),
	http: Symbol.for("Http"),

	//repo
	userRepo: Symbol.for("UserRepository"),
	otpRepo: Symbol.for("OtpRepository"),
	notificationRepo: Symbol.for("NotificationRepository"),
	broadcastRepo: Symbol.for("BroadcastRepository"),

	//  services
	authService: Symbol.for("AuthService"),
	userService: Symbol.for("UserService"),
	notificationService: Symbol.for("NotificationService"),
	broadcastService: Symbol.for("BroadcastService"),
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

// UPDATES //
export type UpdateUser = Partial<Users>;
export type UpdateOTP = Partial<OTPs>;
export type UpdateNotification = Partial<Notifications>;
export type UpdateNotificationBroadcast = Partial<Notification_Broadcast>;
