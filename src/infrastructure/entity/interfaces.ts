import type { Users, OTPs, Notifications } from "@prisma/client";
import type {
	CreateOTP,
	CreateUser,
	CreateNotification,
	UpdateOTP,
	UpdateUser,
	UpdateNotification,
} from "./types";

// utils
export interface ILogger {
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
}

export interface IJwtPayload {
	user_id: string;
	role: string | null;
	iat?: number;
	exp?: number;
}

// models
export interface IUser {
	getAll: () => Promise<Users[]>;
	getOne: (id: string) => Promise<Users | null>;
	create: (data: CreateUser) => Promise<Users | null>;
	update: (id: string, data: UpdateUser) => Promise<Users>;
	delete: (id: string) => Promise<void>;
}

export interface IOTP {
	getAll: () => Promise<OTPs[]>;
	getOne: (id: string) => Promise<OTPs | null>;
	create: (data: CreateOTP) => Promise<OTPs | null>;
	update: (id: string, data: UpdateOTP) => Promise<OTPs>;
	delete: (id: string) => Promise<void>;
}

export interface INotification {
	getAll: () => Promise<Notifications[]>;
	getOne: (id: string) => Promise<Notifications | null>;
	create: (data: CreateNotification) => Promise<Notifications | null>;
	update: (id: string, data: UpdateNotification) => Promise<Notifications>;
	delete: (id: string) => Promise<void>;
}
