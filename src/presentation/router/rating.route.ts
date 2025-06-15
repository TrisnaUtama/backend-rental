import { RatedEntityType, Roles } from "@prisma/client";
import jwt from "@elysiajs/jwt";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import type { UpdateRating } from "../../infrastructure/entity/types";
import { Elysia, t } from "elysia";
import {
	userService,
	ratingServie,
	recomendationService,
} from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { response } from "../../application/instances";

export const ratingRoute = new Elysia({
	prefix: "/v1/rating",
	detail: {
		tags: ["RATING"],
	},
})
	.get("/", async ({ set }) => {
		try {
			const users = await ratingServie.getAll();
			if (!users) {
				throw response.badRequest(
					"Something went wrong while retreived ratings",
				);
			}

			set.status = 200;
			return StandardResponse.success(users, "Successfully retreived ratings");
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
		const user = await userService.getOne(userId.toString());
		return {
			user,
		};
	})
	.get("/:id", async ({ set, params }) => {
		try {
			const user = await ratingServie.getOne(params.id);

			if (!user) {
				throw response.notFound("rating not found !");
			}

			set.status = 200;
			return StandardResponse.success(
				user,
				"Succesfully retreived data rating",
			);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	})
	.get("target/:id", async ({ set, params }) => {
		try {
			const user = await ratingServie.getByTragetId(params.id);

			if (!user) {
				throw response.notFound("rating not found !");
			}

			set.status = 200;
			return StandardResponse.success(
				user,
				"Succesfully retreived data rating",
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
				const payload = {
					ratedType: body.ratedType,
					ratingValue: body.ratingValue,
					targetId: body.targetId,
					userId: body.userId,
					status: true,
					comment: body.comment,
				};
				const new_account = await ratingServie.create(payload);
				if (!new_account) {
					throw response.badRequest("Error while creating user data");
				}
				if (new_account.ratedType === "DESTINATION") {
					await recomendationService.retrainModel();
				}

				set.status = 201;
				return StandardResponse.success(
					new_account,
					"Successfuly creating user data",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				ratedType: t.Enum(RatedEntityType, {
					min: 1,
					error: "User must have role",
				}),
				targetId: t.String({
					minLength: 1,
					description: "UUID of the entity being rated",
				}),
				ratingValue: t.Integer({
					minimum: 1,
					maximum: 5,
					description: "Rating value between 1 and 5",
				}),
				userId: t.String({
					minLength: 1,
					description: "user is required",
				}),
				comment: t.String({
					minLength: 5,
					description: "comment is required",
				}),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ params, set, body }) => {
			try {
				const payload: UpdateRating = {
					ratedType: body.ratedType,
					ratingValue: body.ratingValue,
					targetId: body.targetId,
					userId: body.userId,
					status: body.status,
				};
				const updated_rating = await ratingServie.update(params.id, payload);
				return StandardResponse.success(updated_rating, "Successfully logout");
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				ratedType: t.Enum(RatedEntityType, {
					min: 1,
					error: "Rated Type is required",
				}),
				targetId: t.String({
					minLength: 1,
					description: "UUID of the entity being rated",
				}),
				ratingValue: t.Integer({
					minimum: 1,
					maximum: 5,
					description: "Rating value between 1 and 5",
				}),
				userId: t.String({
					minLength: 1,
					description: "user is required",
				}),
				status: t.Boolean({
					description: "A flag indicating the status, must be true or false",
				}),
			}),
		},
	)
	.delete("/:id", async ({ params, set }) => {
		try {
			set.status = 204;
			await ratingServie.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
