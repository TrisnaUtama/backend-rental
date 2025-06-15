import { Elysia, t } from "elysia";
import type {
  CreateNotification,
  UpdateNotification,
} from "../../infrastructure/entity/types";
import {
  notificationService,
  broadcastService,
  response,
} from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { Notification_Type } from "@prisma/client";

export const notificationRoute = new Elysia({
  prefix: "/v1/notifications",
  detail: {
    tags: ["NOTIFICATION & BROADCAST"],
  },
})
  .get("/", async ({ set }) => {
    try {
      const notifications = await notificationService.getAll();
      if (!notifications) {
        throw response.badRequest(
          "Something went wrong while retrieving notifications"
        );
      }

      if (notifications.length === 0) {
        throw response.notFound("Notifications is empty !");
      }

      set.status = 200;
      return StandardResponse.success(
        notifications,
        "Successfully retrieved notifications"
      );
    } catch (error) {
      return GlobalErrorHandler.handleError(error, set);
    }
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const notification = await notificationService.getOne(params.id);
      if (!notification) {
        throw response.badRequest(
          "Something went wrong while retrieving notification"
        );
      }
      set.status = 200;
      return StandardResponse.success(
        notification,
        "Successfully retrieved notification"
      );
    } catch (error) {
      return GlobalErrorHandler.handleError(error, set);
    }
  })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const payload: CreateNotification = {
          message: body.message,
          title: body.title,
          type: body.type,
          promo_id: body.promo_id as string,
          status: true,
        };

        const notification = await notificationService.create(payload);
        if (!notification) {
          throw response.badRequest("Error while creating notification !");
        }
        set.status = 201; // Use 201 Created for successful post requests
        return StandardResponse.success(
          notification,
          "Successfully creating notification"
        );
      } catch (error) {
        return GlobalErrorHandler.handleError(error, set);
      }
    },
    {
      body: t.Object({
        title: t.String({
          minLength: 5,
          error: "title must be at least 5 characters",
        }),
        message: t.String({
          minLength: 20,
          error: "message must be at least 20 characters",
        }),
        type: t.Enum(Notification_Type, {
          error: "A valid notification type must be selected",
        }),
        // Add optional promo_id to validation schema
        promo_id: t.Optional(t.String()),
      }),
    }
  )
  // NEW ENDPOINT: Broadcast a specific promo to ALL users
  .post(
    "/promo/all",
    async ({ body, set }) => {
      try {
        // This single service call handles everything: creating the notification,
        // creating the broadcast records, and triggering the emails.
        const result = await broadcastService.sendPromoNotification(
          body.promoId,
          "all"
        );
        if (!result) {
          throw response.badRequest(
            "Error while broadcasting promo notification!"
          );
        }
        set.status = 200;
        return StandardResponse.success(
          result,
          "Successfully broadcasted promo to all users."
        );
      } catch (error) {
        return GlobalErrorHandler.handleError(error, set);
      }
    },
    {
      body: t.Object({
        promoId: t.String({
          minLength: 1,
          error: "promoId must be provided.",
        }),
      }),
      detail: {
        summary: "Broadcast a Promo to All Users",
        description:
          "Takes a promo ID and sends a notification and email to every user in the system.",
      },
    }
  )
  // NEW ENDPOINT: Broadcast a specific promo to a list of users
  .post(
    "/promo/specific",
    async ({ body, set }) => {
      try {
        const result = await broadcastService.sendPromoNotification(
          body.promoId,
          body.userIds
        );
        if (!result) {
          throw response.badRequest(
            "Error while broadcasting promo notification!"
          );
        }
        set.status = 200;
        return StandardResponse.success(
          result,
          `Successfully broadcasted promo to ${body.userIds.length} specific users.`
        );
      } catch (error) {
        return GlobalErrorHandler.handleError(error, set);
      }
    },
    {
      body: t.Object({
        promoId: t.String({
          minLength: 1,
          error: "promoId must be provided.",
        }),
        userIds: t.Array(t.String(), {
          minItems: 1,
          error: "userIds must be an array with at least one user ID.",
        }),
      }),
      detail: {
        summary: "Broadcast a Promo to Specific Users",
        description:
          "Takes a promo ID and a list of user IDs to send a targeted notification and email.",
      },
    }
  )
  // PATCH /:id - Updates an existing notification
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      try {
        // The service layer already performs this check, so this is redundant
        // but kept for explicitness.
        const existing_notification = await notificationService.getOne(
          params.id
        );
        if (!existing_notification) {
          throw response.notFound("Notification to update not found!");
        }

        const payload: UpdateNotification = {
          message: body.message,
          title: body.title,
          type: body.type,
        };

        const updated_notification = await notificationService.update(
          params.id,
          payload
        );
        if (!updated_notification) {
          throw response.badRequest("Error while updating notification !");
        }

        return StandardResponse.success(
          updated_notification,
          "Successfully updating notification"
        );
      } catch (error) {
        return GlobalErrorHandler.handleError(error, set);
      }
    },
    {
      body: t.Partial(
        t.Object({
          title: t.String({
            minLength: 5,
            error: "title must be at least 5 characters",
          }),
          message: t.String({
            minLength: 20,
            error: "message must be at least 20 characters",
          }),
          type: t.Enum(Notification_Type, {
            error: "A valid notification type must be selected",
          }),
        })
      ),
    }
  )
  // DELETE /:id - Deletes a notification (soft delete)
  .delete("/:id", async ({ params, set }) => {
    try {
      await notificationService.delete(params.id);
      set.status = 204; // No Content is appropriate for a successful delete
      return;
    } catch (error) {
      return GlobalErrorHandler.handleError(error, set);
    }
  });
