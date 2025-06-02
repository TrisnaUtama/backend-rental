import { Elysia, t } from "elysia";
import { travelPackageService, response } from "./../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import type {
	CreateTravelPackage,
	UpdatePax,
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
				const payload: CreateTravelPackage = {
					description: body.description,
					duration: body.duration,
					name: body.name,
					image: body.image,
					accommodation_id: body.accomodation_id || null,
				};
				const payload_dest = body.travel_package_destinations.map(
					(travel_destination) => ({
						destination_id: travel_destination.destination_id,
					}),
				);
				const payload_pax = body.pax_options.map((travel_pax) => ({
					pax: travel_pax.pax,
					price: new Prisma.Decimal(travel_pax.price),
				}));
				const payload_itineraries = body.travel_itineraries.map(
					(itineraries) => ({
						destination_id: itineraries.destination_id,
						day_number: itineraries.day_number,
						description: itineraries.description || "",
					}),
				);

				const create_travel_pack = await travelPackageService.create(
					payload,
					payload_dest,
					payload_pax,
					payload_itineraries,
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
				name: t.String({
					minLength: 1,
					errorMessage: { minLength: "Name is required" },
				}),
				image: t.String({
					minLength: 1,
					errorMessage: { minLength: "image must not be empty" },
				}),
				duration: t.Integer({
					minimum: 1,
					errorMessage: { minimum: "Duration must be at least 1 day" },
				}),
				description: t.String({
					minLength: 1,
					errorMessage: { minLength: "Description is required" },
				}),
				accomodation_id: t.Optional(
					t.String({
						errorMessage: { minLength: "Description is required" },
					}),
				),
				travel_package_destinations: t.Array(
					t.Object({
						destination_id: t.String({
							minLength: 1,
							error: "Destination must be filled",
						}),
					}),
					{
						error:
							"Destination must be an array of objects with destination and travel id",
					},
				),
				pax_options: t.Array(
					t.Object({
						pax: t.Integer({
							minLength: 1,
							error: "Pax must be filled",
						}),
						price: t.Integer({
							minimum: 200000,
							error: "Price must be atleast Rp.200.000,00",
						}),
					}),
					{
						error:
							"Travel Pax must be an array of objects with destination and travel id",
					},
				),
				travel_itineraries: t.Array(
					t.Object({
						destination_id: t.String({
							minLength: 1,
							error: "Destination ID is required",
						}),
						day_number: t.Integer({
							minimum: 1,
							error: "Day number must be at least 1",
						}),
						description: t.Optional(
							t.String({
								maxLength: 500,
								error: "Description must be less than 500 characters",
							}),
						),
					}),
					{
						error: "Travel itineraries must be a valid array",
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
				const payload: UpdateTravelPackage = {
					description: body.description ?? travel_package.description,
					duration: body.duration ?? travel_package.duration,
					name: body.name ?? travel_package.name,
					image: body.image ?? travel_package.image,
				};

				const payload_dest: UpdateTravelPackageDestination[] = (
					body.travel_package_destinations ?? []
				).map((travel_destination) => ({
					id: travel_destination.id,
					destination_id: travel_destination.destination_id,
					travel_package_id: travel_package.id,
				}));
				const payload_pax: UpdatePax[] = (body.pax_options ?? []).map(
					(travel_pax) => ({
						id: travel_pax.id,
						price: new Prisma.Decimal(travel_pax.price),
						pax: travel_pax.price,
						travel_package_id: travel_package.id,
					}),
				);
				const payload_itineraries: UpdatePax[] = (
					body.travel_itineraries ?? []
				).map((itineraries) => ({
					id: itineraries.id,
					destination_id: itineraries.destination_id,
					day_number: itineraries.day_number,
					description: itineraries.description || "",
				}));

				const create_travel_pack = await travelPackageService.update(
					params.id,
					payload,
					payload_dest,
					payload_pax,
					payload_itineraries,
				);
				if (!create_travel_pack)
					throw response.badRequest("Error while creating new travel packages");

				set.status = 201;
				return StandardResponse.success(
					create_travel_pack,
					"Success updating new travel packages",
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
						minLength: 1,
						errorMessage: { minLength: "Name must not be empty" },
					}),
					image: t.String({
						minLength: 1,
						errorMessage: { minLength: "image must not be empty" },
					}),
					duration: t.Integer({
						minimum: 1,
						errorMessage: { minimum: "Duration must be at least 1 day" },
					}),
					description: t.String({
						minLength: 1,
						errorMessage: { minLength: "Description must not be empty" },
					}),
					travel_package_destinations: t.Array(
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
					pax_options: t.Array(
						t.Object({
							id: t.String(),
							pax: t.Integer({
								minLength: 1,
								error: "Pax must be filled",
							}),
							price: t.Integer({
								minimum: 200000,
								error: "Price must be atleast Rp.200.000,00",
							}),
						}),
						{
							error:
								"Travel Pax must be an array of objects with destination and travel id",
						},
					),
					travel_itineraries: t.Array(
						t.Object({
							id: t.String(),
							destination_id: t.String({
								minLength: 1,
								error: "Destination ID is required",
							}),
							day_number: t.Integer({
								minimum: 1,
								error: "Day number must be at least 1",
							}),
							description: t.Optional(
								t.String({
									maxLength: 500,
									error: "Description must be less than 500 characters",
								}),
							),
						}),
						{
							error: "Travel itineraries must be a valid array",
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
