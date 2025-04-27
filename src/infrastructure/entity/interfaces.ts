import type {
	Users,
	OTPs,
	Notifications,
	Notification_Broadcast,
	Vehicles,
	Destinations,
	Destination_Fasilities,
} from "@prisma/client";
import type {
	CreateOTP,
	CreateUser,
	CreateNotification,
	UpdateOTP,
	UpdateUser,
	UpdateNotification,
	CreateNotificationBroadcast,
	UpdateNotificationBroadcast,
	CreateVehicle,
	UpdateVehicle,
	CreateDestination,
	UpdateDestination,
	CreateFacility,
	UpdateFacility,
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
	create: (payload: CreateUser) => Promise<Users | null>;
	update: (id: string, payload: UpdateUser) => Promise<Users>;
}

export interface IOTP {
	getAll: () => Promise<OTPs[]>;
	getOne: (id: string) => Promise<OTPs | null>;
	create: (payload: CreateOTP) => Promise<OTPs | null>;
	update: (id: string, payload: UpdateOTP) => Promise<OTPs>;
}

export interface INotification {
	getAll: () => Promise<Notifications[]>;
	getOne: (id: string) => Promise<Notifications | null>;
	create: (payload: CreateNotification) => Promise<Notifications | null>;
	update: (id: string, payload: UpdateNotification) => Promise<Notifications>;
}

export interface INotificationBroadcast {
	getAll: () => Promise<Notification_Broadcast[]>;
	getOne: (id: string) => Promise<Notification_Broadcast | null>;
	getAllByNotifId: (id: string) => Promise<Notification_Broadcast[] | null>;
	create: (
		payload: CreateNotificationBroadcast,
	) => Promise<Notification_Broadcast | null>;
	createMany: (
		payload: CreateNotificationBroadcast[],
	) => Promise<{ count: number }>;
	update: (
		id: string,
		payload: UpdateNotificationBroadcast,
	) => Promise<Notification_Broadcast>;
}

export interface IVehicles {
	getAll: () => Promise<Vehicles[]>;
	getOne: (id: string) => Promise<Vehicles | null>;
	create: (payload: CreateVehicle) => Promise<Vehicles | null>;
	update: (id: string, payload: UpdateVehicle) => Promise<Vehicles>;
}

export interface IDestinations {
	getAll: () => Promise<Destinations[]>;
	getOne: (id: string) => Promise<Destinations | null>;
	create: (payload: CreateDestination) => Promise<Destinations | null>;
	update: (id: string, payload: UpdateDestination) => Promise<Destinations>;
}

export interface IFacilities {
	getAllByIdDestination: (id: string) => Promise<Destination_Fasilities[]>;
	getOne: (id: string) => Promise<Destination_Fasilities | null>;
	createMany: (payload: CreateFacility[]) => Promise<{ count: number }>;
	update: (
		payload: UpdateFacility[]
	) => Promise<Destination_Fasilities[]>;
	// updateMany: (
    //     facilities: UpdateFacility[],
    // ) => Promise<Destination_Fasilities[]>;
}
