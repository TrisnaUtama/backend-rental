import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { refundService } from "../../application/instances";
import { verifyJwt } from "../../infrastructure/utils/jwt";
import {
    userService,
} from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { response } from "../../application/instances";
import type { IJwtPayload } from "../../infrastructure/entity/interfaces";

const ApproveRefundBody = t.Object({
  admin_notes: t.Optional(t.String()),
  transfer_proof: t.String({ error: "transfer_proof URL is required." }),
});

const RejectRefundBody = t.Object({
  admin_notes: t.String({ error: "A reason for rejection is required." }),
});

export const refundRoute = new Elysia({
  prefix: "/v1/refunds",
  detail: {
    tags: ["ADMIN - REFUNDS"],
  },
})
  .use(
    jwt({
      name: `${process.env.JWT_NAME}`,
      secret: `${process.env.JWT_SECRET_KEY}`,
    })
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
    if (!user || !user.refresh_token || user.role === "DRIVER") {
      set.status = 403;
      throw response.forbidden();
    }
    return {
      user,
    };
  })
  .get("/", async ({ set }) => {
    try {
      const refunds = await refundService.getAll();
      return StandardResponse.success(
        refunds,
        "All refund requests fetched successfully."
      );
    } catch (error) {
      return GlobalErrorHandler.handleError(error, set);
    }
  })
  .get("/:id", async ({ set, params }) => {
    try {
      const refund = await refundService.getOne(params.id);
      return StandardResponse.success(
        refund,
        "Refund request details fetched successfully."
      );
    } catch (error) {
      return GlobalErrorHandler.handleError(error, set);
    }
  })
  .patch(
    "/:id/approve",
    async ({ set, params, body }) => {
      try {
        const updatedRefund = await refundService.update(params.id, body, 'approve');
        return StandardResponse.success(
          updatedRefund,
          "Refund has been approved and processed."
        );
      } catch (error) {
        return GlobalErrorHandler.handleError(error, set);
      }
    },
    { body: ApproveRefundBody }
  )
  .patch(
    "/:id/reject",
    async ({ set, params, body }) => {
      try {
        const updatedRefund = await refundService.update(params.id, body, 'reject');
        if(!updatedRefund){
            throw response.notFound("Not foound")
        }
        return StandardResponse.success(
          updatedRefund,
          "Refund request has been rejected."
        );
      } catch (error) {
        return GlobalErrorHandler.handleError(error, set);
      }
    },
    { body: RejectRefundBody }
  );