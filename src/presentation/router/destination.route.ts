import {
	destinationService,
	response,
	userService,
} from "./../../application/instances";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import type {
	CreateDestination,
	UpdateDestination,
	UpdateFacility,
} from "../../infrastructure/entity/types";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import { verifyJwt } from "../../infrastructure/utils/jwt";

export const destinationRoute = new Elysia({
	prefix: "/v1/destinations",
	detail: {
		tags: ["DESTINATIONS"],
	},
})
	// .use(
	// 	jwt({
	// 		name: `${process.env.JWT_NAME}`,
	// 		secret: `${process.env.JWT_SECRET_KEY}`,
	// 	}),
	// )
	// .derive(async ({ cookie: { access_token }, set }) => {
	// 	if (!access_token.value) {
	// 		set.status = 401;
	// 		throw response.unauthorized();
	// 	}
	// 	const jwtPayload: IJwtPayload = verifyJwt(access_token.value.toString());

	// 	if (!jwtPayload) {
	// 		set.status = 403;
	// 		throw response.forbidden();
	// 	}

	// 	const userId = jwtPayload.user_id;
	// 	if (!userId) throw response.badRequest("Invalid Payload !");
	// 	const user = await userService.getOne(userId.toString());
	// 	if (!user || !user.refresh_token) {
	// 		set.status = 403;
	// 		throw response.forbidden();
	// 	}

	// 	return {
	// 		user,
	// 	};
	// })
	.get("/", async ({ set }) => {
		try {
			const destinations = await destinationService.getAll();
			if (!destinations)
				throw response.badRequest("Error while retreived destinations !");
			if (destinations.length === 0)
				throw response.badRequest("Destinations is empty !");

			set.status = 200;
			return StandardResponse.success(
				destinations,
				"Successfully retreived destination",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ params, set }) => {
		try {
			const destination = await destinationService.getOne(params.id);
			set.status = 404;
			if (!destination) throw response.badRequest("Destinations not found !");

			set.status = 200;
			return StandardResponse.success(
				destination,
				"Successdully retreived destination",
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
				const payload_x: CreateDestination = {
					name: body.name,
					open_hour: body.open_hour,
					description: body.description,
					image_urls: body.image_urls,
					latitude: body.latitude,
					longitude: body.longitude,
					status: body.status ?? true,
				};

				const payload_y = body.facilities.map((facility) => ({
					destination_id: "",
					name: facility.name,
					status: facility.status ?? true,
				}));

				const destination = await destinationService.create(
					payload_x,
					payload_y,
				);

				if (!destination)
					throw response.badRequest("Error while creating new Destination");

				set.status = 201;
				return StandardResponse.success(
					destination,
					"Success creating new destination",
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
					error: "Destination name must be at least 5 characters",
				}),
				open_hour: t.String({
					minLength: 5,
					error: "Open hour must be at least 5 characters",
				}),
				description: t.String({
					minLength: 20,
					error: "Description must be at least 20 characters",
				}),
				image_urls: t.Array(t.String(), {
					error: "Image URLs must be an array of strings",
				}),
				latitude: t.String({
					minLength: 5,
					error: "Latitude must be at least 5 characters",
				}),
				longitude: t.String({
					minLength: 5,
					error: "Longitude must be at least 5 characters",
				}),
				status: t.Boolean({
					default: true,
				}),
				facilities: t.Array(
					t.Object({
						name: t.String({
							minLength: 3,
							error: "Facility name must be at least 3 characters",
						}),
						status: t.Boolean({
							default: true,
						}),
					}),
					{
						error:
							"Facilities must be an array of objects with name and status",
					},
				),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ set, body, params }) => {
			try {
				const payload_x: UpdateDestination = {
					name: body.name,
					open_hour: body.open_hour,
					description: body.description,
					image_urls: body.image_urls,
					latitude: body.latitude,
					longitude: body.longitude,
					status: body.status ?? true,
				};

				const payload_y: UpdateFacility[] = body.facilities.map((facility) => ({
					id: facility.id,
					name: facility.name,
					status: facility.status ?? true,
				}));

				const updatedDestination = await destinationService.update(
					params.id,
					payload_x,
					payload_y,
				);
				set.status = 201;
				return StandardResponse.success(
					updatedDestination,
					"Success updating destination and facilities",
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
					error: "Destination name must be at least 5 characters",
				}),
				open_hour: t.String({
					minLength: 5,
					error: "Open hour must be at least 5 characters",
				}),
				description: t.String({
					minLength: 20,
					error: "Description must be at least 20 characters",
				}),
				image_urls: t.Array(t.String(), {
					error: "Image URLs must be an array of strings",
				}),
				latitude: t.String({
					minLength: 5,
					error: "Latitude must be at least 5 characters",
				}),
				longitude: t.String({
					minLength: 5,
					error: "Longitude must be at least 5 characters",
				}),
				status: t.Boolean({
					default: true,
				}),
				facilities: t.Array(
					t.Object({
						id: t.String(),
						name: t.String({
							minLength: 3,
							error: "Facility name must be at least 3 characters",
						}),
						status: t.Boolean({
							default: true,
						}),
					}),
					{
						error:
							"Facilities must be an array of objects with id, name, and status",
					},
				),
			}),
		},
	)
	.delete("/:id", async ({ set, params }) => {
		try {
			set.status = 204;
			await destinationService.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
