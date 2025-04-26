import { BroadcastService } from "./../../application/services/broadcast.services";
import { Elysia, t } from "elysia";
import type {
	CreateNotification,
	CreateNotificationBroadcast,
	UpdateNotification,
} from "../../infrastructure/entity/types";
import { notificationService } from "../../application/instances";
import { braodcastService } from "../../application/instances";
import { StandardResponse } from "../../infrastructure/utils/response/standard.response";
import { GlobalErrorHandler } from "../../infrastructure/utils/response/global.response";
import { Notification_Type } from "@prisma/client";
import { response } from "../../application/instances";

export const notificationRoute = new Elysia({ prefix: "/v1/notifications" })
	.get("/", async ({ set }) => {
		try {
			const notifications = await notificationService.getAll();
			if (!notifications) {
				throw response.badRequest(
					"Somethig went wrong while retreived notifications",
				);
			}

			if (notifications.length === 0) {
				throw response.notFound("Notifications is empty !");
			}

			set.status = 200;
			return StandardResponse.success(
				notifications,
				"Successfully retreived notifications",
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
					"Something went wrong while retreived notification",
				);
			}

			set.status = 200;
			return StandardResponse.success(
				notification,
				"Successfully retreived notification",
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
				const payload: CreateNotification = {
					message: body.message,
					title: body.title,
					type: body.type,
					status: true,
				};

				const notification = await notificationService.create(payload);
				if (!notification) {
					throw response.badRequest("Error while creating notification !");
				}
				set.status = 200;
				return StandardResponse.success(
					notification,
					"Successfuly creating notification",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				title: t.String({
					minLength: 5,
					error: "tittle must be at least 5 character",
				}),
				message: t.String({
					minLength: 20,
					error: "message must be at least 20 character",
				}),
				type: t.Enum(Notification_Type, {
					error: "notification type must be at least picked",
				}),
			}),
		},
	)
	.post(
		"/broadcast",
		async ({ body, set }) => {
			try {
				const notification = await braodcastService.broadcastToAll(
					body.notification_id,
				);
				if (!notification) {
					throw response.badRequest("Error while creating notification !");
				}
				set.status = 200;
				return StandardResponse.success(
					notification,
					"Successfuly creating notification",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Object({
				notification_id: t.String({
					minLength: 5,
					error: "id must be filled",
				}),
			}),
		},
	)
	.patch(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const existing_notification = await notificationService.getOne(
					params.id,
				);
				if (!existing_notification) {
					throw response.badRequest("Error while retreiving Notification");
				}

				const payload: UpdateNotification = {
					message: body.message,
					title: body.title,
					type: body.type,
				};

				const updated_notification = await notificationService.update(
					params.id,
					payload,
				);
				if (!updated_notification) {
					throw response.badRequest("Error while updating notification !");
				}

				return StandardResponse.success(
					updated_notification,
					"Successfuly updating notification",
				);
			} catch (error) {
				set.status = 500;
				return GlobalErrorHandler.handleError(error, set);
			}
		},
		{
			body: t.Partial(
				t.Object({
					title: t.String({
						minLength: 5,
						error: "tittle must be at least 5 character",
					}),
					message: t.String({
						minLength: 20,
						error: "message must be at least 20 character",
					}),
					type: t.Enum(Notification_Type, {
						error: "notification type must be at least picked",
					}),
				}),
			),
		},
	)
	.delete("/:id", async ({ params, set }) => {
		try {
			set.status = 204;
			await notificationService.delete(params.id);
		} catch (error) {
			set.status = 500;
			return GlobalErrorHandler.handleError(error, set);
		}
	});
