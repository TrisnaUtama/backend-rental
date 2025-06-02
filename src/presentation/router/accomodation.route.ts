import { RatedEntityType } from "@prisma/client";
import jwt from "@elysiajs/jwt";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import type {
	CreateAccomodation,
	UpdateAccomodation,
} from "../../infrastructure/entity/types";
import { Elysia, t } from "elysia";
import { userService, accomodationService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { response } from "../../application/instances";
import { Decimal } from "@prisma/client/runtime/library";

export const accomodationRoute = new Elysia({
	prefix: "/v1/accomodation",
	detail: {
		tags: ["ACCOMODATION"],
	},
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
		const user = await userService.getOne(userId.toString());
		return {
			user,
		};
	})
	.get("/", async ({ set }) => {
		try {
			const accomodations = await accomodationService.getAll();
			if (!accomodations) {
				throw response.badRequest(
					"Something went wrong while retreived accomodations",
				);
			}

			set.status = 200;
			return StandardResponse.success(
				accomodations,
				"Successfully retreived accomodations",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("/:id", async ({ set, params }) => {
		try {
			const accomodation = await accomodationService.getOne(params.id);

			if (!accomodation) {
				throw response.notFound("accomodation not found !");
			}

			set.status = 200;
			return StandardResponse.success(
				accomodation,
				"Succesfully retreived data accomodation",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const payload: CreateAccomodation = {
					address: body.address,
					description: body.description || null,
					image_urls: body.image_urls,
					name: body.name,
					price_per_night: new Decimal(body.price_per_night),
					status: true,
                    facilities: body.facilities
				};

				const new_accomodation = await accomodationService.create(payload);
				if (!new_accomodation) {
					throw response.badRequest("Error while creating accomodation");
				}

				set.status = 201;
				return StandardResponse.success(
					new_accomodation,
					"Successfuly creating accomodation data",
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
				address: t.String({
					minLength: 1,
					errorMessage: { minLength: "Address is required" },
				}),
				description: t.Optional(
					t.String({
						errorMessage: { type: "Description must be a string" },
					}),
				),
				image_urls: t.Array(
					t.String({
						errorMessage: { format: "Each image URL must be valid" },
					}),
					{
						minLength: 1,
						errorMessage: { minLength: "At least one image URL is required" },
					},
				),
                facilities: t.Array(
					t.String({
						minLength: 3,
						error: "Facility name must be at least 3 characters",
					}),
				),
				price_per_night: t.Number({
					errorMessage: { type: "Price per night must be a number" },
				}),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ params, set, body }) => {
			try {
				const payload: CreateAccomodation = {
					address: body.address,
					description: body.description || null,
					image_urls: body.image_urls,
					name: body.name,
					price_per_night: new Decimal(body.price_per_night),
					status: body.status,
                    facilities: body.facilities
				};
				const update_accomodation = await accomodationService.update(
					params.id,
					payload,
				);
				return StandardResponse.success(
					update_accomodation,
					"Successfully update accomodation",
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
				address: t.String({
					minLength: 1,
					errorMessage: { minLength: "Address is required" },
				}),
				description: t.Optional(
					t.String({
						errorMessage: { type: "Description must be a string" },
					}),
				),
				image_urls: t.Array(
					t.String({
						errorMessage: { format: "Each image URL must be a valid URI" },
					}),
					{
						minLength: 1,
						errorMessage: { minLength: "At least one image URL is required" },
					},
				),
				price_per_night: t.Number({
					errorMessage: { type: "Price per night must be a number" },
				}),
                facilities: t.Array(
					t.String({
						minLength: 3,
						error: "Facility name must be at least 3 characters",
					}),
				),
				status: t.Boolean({
					errorMessage: { type: "Status must be true or false" },
				}),
			}),
		},
	)
	.delete("/:id", async ({ params, set }) => {
		try {
			set.status = 204;
			await accomodationService.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
