import { Elysia, t } from "elysia";
import { travelPackageService, response } from "./../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import type {
	CreateTravelPackage,
	UpdateTravelPackage,
	UpdateTravelPackageDestination,
} from "../../infrastructure/entity/types";
import { Prisma } from "@prisma/client";

export const travelRoute = new Elysia({
	prefix: "/v1/travel",
	detail: { tags: ["TRAVEL"] },
})
	.get("/", async ({ set }) => {
		try {
			const travel_packages = await travelPackageService.getAll();
			if (!travel_packages)
				throw response.badRequest("Error while retreiving travel packages");
			set.status = 200;
			return StandardResponse.success(
				travel_packages,
				"Successfully retreiving travel packages",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ params, set }) => {
		try {
			const travel_package = await travelPackageService.getOne(params.id);
			if (!travel_package)
				throw response.badRequest("Error while retreiving travel package");

			set.status = 200;
			return StandardResponse.success(
				travel_package,
				"Successfully retreiving travel package",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.post(
		"/",
		async ({ set, body }) => {
			try {
				const payload_x: CreateTravelPackage = {
					vehicle_id: body.vehicle_id,
					description: body.description,
					duration: body.duration,
					name: body.name,
					price: new Prisma.Decimal(body.price),
				};

				const payload_y = body.travel_destinations.map(
					(travel_destination) => ({
						destination_id: travel_destination.destination_id,
					}),
				);

				const create_travel_pack = await travelPackageService.create(
					payload_x,
					payload_y,
				);

				if (!create_travel_pack)
					throw response.badRequest("Error while creating new travel packages");

				set.status = 201;
				return StandardResponse.success(
					create_travel_pack,
					"Success creating new travel packages",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				vehicle_id: t.String({
					minLength: 1,
					errorMessage: { minLength: "Vehicle ID is required" },
				}),
				name: t.String({
					minLength: 1,
					errorMessage: { minLength: "Name is required" },
				}),
				price: t.Number({
					minimum: 0,
					errorMessage: { minimum: "Price must be greater than or equal to 0" },
				}),
				duration: t.Integer({
					minimum: 1,
					errorMessage: { minimum: "Duration must be at least 1 day" },
				}),
				description: t.String({
					minLength: 1,
					errorMessage: { minLength: "Description is required" },
				}),
				travel_destinations: t.Array(
					t.Object({
						destination_id: t.String({
							minLength: 1,
							error: "Destination must be filled",
						}),
						// travel_package_id: t.String({
						//     minLength: 1,
						//     error: "Travel Package must be filled",
						// }),
					}),
					{
						error:
							"Destination must be an array of objects with destination and travel id",
					},
				),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ params, set, body }) => {
			try {
				const travel_package = await travelPackageService.getOne(params.id);
				const payload_x: UpdateTravelPackage = {
					vehicle_id: body.vehicle_id ?? travel_package.vehicle_id,
					description: body.description ?? travel_package.description,
					duration: body.duration ?? travel_package.duration,
					name: body.name ?? travel_package.name,
					price:
						body.price !== undefined
							? new Prisma.Decimal(body.price)
							: travel_package.price,
				};

				const payload_y: UpdateTravelPackageDestination[] = (
					body.travel_destinations ?? []
				).map((travel_destination) => ({
					id: travel_destination.id,
					destination_id: travel_destination.destination_id,
					travel_package_id: travel_package.id,
				}));

				const create_travel_pack = await travelPackageService.update(
					params.id,
					payload_x,
					payload_y,
				);
				if (!create_travel_pack)
					throw response.badRequest("Error while creating new travel packages");

				return create_travel_pack;
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Partial(
				t.Object({
					vehicle_id: t.String({
						minLength: 1,
						errorMessage: { minLength: "Vehicle ID must not be empty" },
					}),
					name: t.String({
						minLength: 1,
						errorMessage: { minLength: "Name must not be empty" },
					}),
					price: t.Number({
						minimum: 0,
						errorMessage: {
							minimum: "Price must be greater than or equal to 0",
						},
					}),
					duration: t.Integer({
						minimum: 1,
						errorMessage: { minimum: "Duration must be at least 1 day" },
					}),
					description: t.String({
						minLength: 1,
						errorMessage: { minLength: "Description must not be empty" },
					}),
					travel_destinations: t.Array(
						t.Object({
							id: t.String(),
							destination_id: t.String({
								minLength: 1,
								error: "Destination must be filled",
							}),
						}),
						{
							error:
								"Destination must be an array of objects with destination and travel package",
						},
					),
				}),
			),
		},
	)
	.delete("/:id", async ({ set, params }) => {
		try {
			set.status = 204;
			await travelPackageService.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
