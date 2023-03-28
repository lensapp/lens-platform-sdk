import { Base } from "./Base";
import { throwExpected, ForbiddenException } from "./exceptions";
import { z } from "zod";

const cloudNotificationSchema = z.object({
  title: z.string(),
  description: z.string(),
});

/**
 * The zod-based validator for the shape of the JSON here https://k8slens.dev/ads/cloud_notifications.json
 */
export const cloudNotificationsSchema = z.object({
  /**
   * @deprecated never used in production
   */
  icon: z.string(),
  /**
   * @deprecated never used in production
   */
  color: z.string(),
  notifications: z.array(cloudNotificationSchema),
});

/**
 * The shape of the JSON here https://k8slens.dev/ads/cloud_notifications.json
 */
export type CloudNotification = z.infer<typeof cloudNotificationSchema>;

/**
 * Notification severity levels
 */
export const severityLevels = ["blocker", "critical", "major", "minor", "low"] as const;

/**
 * Notification kinds, used to determine how to display the notification
 */
export const notificationKind = ["link", "dialog", "text"] as const;

const lensCloudNotificationSchema = z.object({
  forUserAttributes: z.array(z.string()).optional(),
  title: z.string().min(1).max(120),
  summary: z.string().min(1),
  severity: z.enum(severityLevels),
  kind: z.enum(notificationKind),
  link: z.union([z.string().startsWith("https://"), z.string().startsWith("lens://")]).optional(),
  context: z.string().startsWith("<").endsWith(">").optional(),
  closeBtnText: z.string().optional(),
});

/**
 * The zod-based validator for the shape of the JSON here https://k8slens.dev/ads/lens_cloud_notifications.json
 */
export const lensCloudNotificationsSchema = z.object({
  notifications: z.array(lensCloudNotificationSchema),
});

/**
 * The shape of the JSON here https://k8slens.dev/ads/lens_cloud_notifications.json
 */
export type LensCloudNotification = z.infer<typeof lensCloudNotificationSchema>;

export class NotificationService extends Base {
  /**
   * Lists notifications for the authenticated user.
   */
  async getMany() {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/notifications`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return z.union([cloudNotificationSchema, lensCloudNotificationSchema]).parse(json);
  }
}
