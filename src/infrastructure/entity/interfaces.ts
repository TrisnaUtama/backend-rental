import type {
	Users,
	OTPs,
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
	CreateTravelPackage,
	UpdateTravelPackage,
	CreateTravelPackageDesination,
	UpdateTravelPackageDestination,
	CreatePromo,
	UpdatePromo,
	CreateBooking,
	UpdateBooking,
	CreatePayment,
	UpdatePayment,
	CreatePax,
	UpdatePax,
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
	getRefreshToken: (token: string) => Promise<Users | null>;
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
export interface ITravelPackages {
	getAll: () => Promise<Travel_Packages[]>;
	getOne: (id: string) => Promise<Travel_Packages | null>;
	create: (payload: CreateTravelPackage) => Promise<Travel_Packages | null>;
	update: (
		id: string,
		payload: UpdateTravelPackage,
	) => Promise<Travel_Packages>;
}
export interface ITravelPax {
	getAll: () => Promise<Travel_Packages_Pax[]>;
	getOne: (id: string) => Promise<Travel_Packages_Pax | null>;
	create: (payload: CreatePax[]) => Promise<{ count: number }>;
	update: (
		payload: UpdatePax[],
	) => Promise<Travel_Packages_Pax[]>;
}
export interface ITravelPackagesDestinations {
	getAll: () => Promise<Travel_Packages_Destinations[]>;
	getOne: (id: string) => Promise<Travel_Packages_Destinations | null>;
	create: (
		payload: CreateTravelPackageDesination[],
	) => Promise<{ count: number }>;
	update: (
		payload: UpdateTravelPackageDestination[],
	) => Promise<Travel_Packages_Destinations[]>;
}

export interface IPromos {
	getAll: () => Promise<Promos[]>;
	getOne: (id: string) => Promise<Promos | null>;
	create: (payload: CreatePromo) => Promise<Promos | null>;
	update: (id: string, payload: UpdatePromo) => Promise<Promos>;
}

export interface IBookings {
	getAll: () => Promise<Bookings[]>;
	getOne: (id: string) => Promise<Bookings | null>;
	getByUserId: (id: string) => Promise<Bookings[] | null>;
	create: (payload: CreateBooking) => Promise<Bookings | null>;
	update: (id: string, payload: UpdateBooking) => Promise<Bookings>;
}

export interface IPayments {
	getAll: () => Promise<Payments[]>;
	getOne: (id: string) => Promise<Payments | null>;
	create: (payload: CreatePayment) => Promise<Payments | null>;
	update: (id: string, payload: UpdatePayment) => Promise<Payments>;
}

export interface IStorage {
	saveImages: (file: File) => Promise<string>;
	getImage: (filename: string) => Promise<string>;
	deleteImage: (filename: string) => Promise<void>;
}
