import type { OTPs, Users } from "@prisma/client";

export const TYPES = {
	//utils
	logger: Symbol.for("Logger"),
	prisma: Symbol.for("PrismaClient"),
	hashed_password: Symbol.for("HashService"),
	error_handler: Symbol.for("ErrorHandler"),
	email: Symbol.for("EmailService"),

	//repo
	userRepo: Symbol.for("UserRepository"),
	otpRepo: Symbol.for("OtpRepository"),

	//  services
	authService: Symbol.for("AuthService"),
	userService: Symbol.for("UserService"),
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

export type CreateOTP = Omit<OTPs, "id" | "created_at" | "updated_at">;

// UPDATES //
export type UpdateUser = Partial<Users>;
export type UpdateOTP = Partial<OTPs>;
