import jwt from "@elysiajs/jwt";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import { Elysia, t } from "elysia";
import { vehicleService } from "./../../application/instances";
import { userService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { response } from "../../application/instances";
import {
	Fuel,
	Prisma,
	Transmission,
	Vehicle_status,
	Vehicle_Types,
} from "@prisma/client";
import type {
	CreateVehicle,
	UpdateVehicle,
} from "../../infrastructure/entity/types";

export const vehicleRoute = new Elysia({
	prefix: "/v1/vehicles",
	detail: {
		tags: ["VEHICLE"],
	},
})
	.get("/", async ({ set }) => {
		try {
			const vehicles = await vehicleService.getAll();
			if (!vehicles) {
				throw response.badRequest(
					"Something went wrong while retreived vehicles",
				);
			}
			set.status = 200;
			return StandardResponse.success(
				vehicles,
				"Successfully retreived vehicles",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ set, params }) => {
		try {
			const vehicle = await vehicleService.getOne(params.id);
			if (!vehicle) {
				throw response.badRequest("Error while retreiving data vehicle !");
			}

			return StandardResponse.success(
				vehicle,
				"Successdully retreived data vehicle",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.use(
		jwt({
			name: `${process.env.JWT_NAME}`,
			secret: `${process.env.JWT_SECRET_KEY}`,
		}),
	)
	.derive(async ({ cookie: { access_token }, set }) => {
		if (!access_token.value) {
			set.status = 401;
			throw response.unauthorized();
		}
		const jwtPayload: IJwtPayload = verifyJwt(access_token.value.toString());

		if (!jwtPayload) {
			set.status = 403;
			throw response.forbidden();
		}

		const userId = jwtPayload.user_id;
		if (!userId) throw response.badRequest("Invalid Payload !");
		const user = await userService.getOne(userId);
		if (!user) {
			set.status = 403;
			throw response.forbidden();
		}

		if (
			!user.refresh_token ||
			(user.role !== "ADMIN_OPERATIONAL" && user.role !== "SUPERADMIN")
		) {
			set.status = 403;
			throw response.forbidden();
		}
		return {
			user,
		};
	})
	.post(
		"/",
		async ({ set, body }) => {
			try {
				const payload: CreateVehicle = {
					name: body.name,
					type: body.type,
					transmition: body.transmition,
					status: body.status,
					fuel: body.fuel,
					kilometer: body.kilometer,
					brand: body.brand,
					capacity: body.capacity,
					year: body.year,
					price_per_day: new Prisma.Decimal(body.price_per_day),
					image_url: body.image_url,
					color: body.color,
					description: body.description,
					deleted_at: null,
				};

				const create_vehicle = await vehicleService.create(payload);
				if (!create_vehicle) {
					throw response.badRequest("Error while creating vehicle !");
				}

				set.status = 201;
				return StandardResponse.success(
					create_vehicle,
					"Successfuly creating new vehicle",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				name: t.String({
					minLength: 5,
					error: "Vehicle name must be atleast 5 character",
				}),
				type: t.Enum(Vehicle_Types, { error: "Vehicle must be 1 of the Type" }),
				transmition: t.Enum(Transmission, {
					error: "Vehicle transmition must be atleast 1 of Transmition types",
				}),
				status: t.Enum(Vehicle_status, {
					error: "Vehicle status must be atleast 1 of Status types",
				}),
				kilometer: t.Number({
					minimum: 100,
					error: "Kilometer must be atleast filled",
				}),
				fuel: t.Enum(Fuel, { error: "Fuel must be atleast 1 of Fuel Type" }),
				brand: t.String({
					minLength: 5,
					error: "Brand must be atleast 5 character",
				}),
				capacity: t.Number({ minLength: 1, error: "Capcity must be filled" }),
				year: t.Integer({ minimum: 1995, error: "Year atleast after 1995" }),
				price_per_day: t.Integer({
					minimum: 100000,
					error: "Price must be atleast Rp.200.000,00",
				}),
				description: t.String({
					minLength: 10,
					error: "Description must be atleast 10 character",
				}),
				image_url: t.Array(
					t.String({ error: "Each image URL must be a valid string" }),
					{
						minItems: 1,
						error: "At least one image URL is required",
					},
				),
				color: t.String({
					minLength: 3,
					error: "Color must be atleast 5 character",
				}),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ params, set, body }) => {
			try {
				const payload: UpdateVehicle = {
					name: body.name,
					type: body.type,
					transmition: body.transmition,
					status: body.status,
					fuel: body.fuel,
					kilometer: body.kilometer,
					brand: body.brand,
					capacity: body.capacity,
					year: body.year,
					price_per_day: new Prisma.Decimal(body.price_per_day || 0),
					image_url: body.image_url,
					color: body.color,
					description: body.description,
				};

				set.status = 201;
				const updated_vehicle = await vehicleService.update(params.id, payload);
				return StandardResponse.success(
					updated_vehicle,
					"Successfully updated data vehicle",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Partial(
				t.Object({
					name: t.String({
						minLength: 5,
						error: "Vehicle name must be atleast 5 character",
					}),
					type: t.Enum(Vehicle_Types, {
						error: "Vehicle must be 1 of the Type",
					}),
					transmition: t.Enum(Transmission, {
						error: "Vehicle transmition must be atleast 1 of Transmition types",
					}),
					status: t.Enum(Vehicle_status, {
						error: "Vehicle status must be atleast 1 of Status types",
					}),
					kilometer: t.Number({
						minimum: 3,
						error: "Kilometer must be atleast 3 character",
					}),
					fuel: t.Enum(Fuel, { error: "Fuel must be atleast 1 of Fuel Type" }),
					brand: t.String({
						minLength: 5,
						error: "Brand must be atleast 5 character",
					}),
					capacity: t.Number({ minimum: 1, error: "Capcity must be filled" }),
					year: t.Integer({ minimum: 1995, error: "Year atleast after 1995" }),
					price_per_day: t.Integer({
						minimum: 200000,
						error: "Price must be atleast Rp.200.000,00",
					}),
					description: t.String({
						minLength: 10,
						error: "Description must be atleast 10 character",
					}),
					image_url: t.Array(
						t.String({ error: "Each image URL must be a valid string" }),
						{
							minItems: 1,
							error: "At least one image URL is required",
						},
					),
					color: t.String({
						minLength: 3,
						error: "Color must be atleast 5 character",
					}),
				}),
			),
		},
	)
	.delete("/:id", async ({ params, set }) => {
		try {
			set.status = 204;
			await vehicleService.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
