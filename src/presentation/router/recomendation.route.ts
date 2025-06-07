import jwt from "@elysiajs/jwt";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";
import { Elysia, t } from "elysia";
import {
  destinationService,
  recomendationService,
  userService,
} from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import { response } from "../../application/instances";

export const recommendationRoute = new Elysia({
  prefix: "/v1/recommendations",
  detail: {
    tags: ["RECOMENDATION"],
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
  .post(
    "/",
    async ({ set, body }) => {
      try {
        const recommendationList = await recomendationService.getAll(body.user_id);
        if (!recommendationList) {
          throw response.badRequest(
            "Something went wrong while retreived recomendation destination"
          );
        }
        const destinationIds = recommendationList.map(
          (item: any) => item.destination_id
        );

        const recomendationDestination =
          await destinationService.getRecomendation(destinationIds);

        set.status = 200;
        return StandardResponse.success(
          recomendationDestination,
          "Successfully retreived recomendation destination"
        );
      } catch (error) {
        set.status = 500;
        return GlobalErrorHandler.handleError(error, set);
      }
    },
    {
      body: t.Object({
        user_id: t.String(),
      }),
    }
  )
  .post("/admin/retrain-model", async ({ body, set }) => {
    try {
      const retrainResponse = await recomendationService.retrainModel();
      set.status = 202;
      return {
        message: "Retrain process triggered successfully",
        detail: retrainResponse,
      };
    } catch (error) {
      set.status = 500;
      return {
        message: "Failed to trigger retrain",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
