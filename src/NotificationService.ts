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
  /** optional, if present, only user with ALL (&& operator) the attributes will get this notifications */
  forUserAttributes: z.array(z.string()).optional(),
  /** the title of the notification */
  title: z.string().min(1).max(120),
  /** the title of the notification */
  summary: z.string().min(1),
  /** the severity enum of the notification */
  severity: z.enum(severityLevels),
  /** the notification kind, text: basic notification, dialog: opens a modal on click, link: open the give .link */
  kind: z.enum(notificationKind),
  /** to be open when clicks, must start with `https://` or `lens://`(custom protocol handler) */
  link: z.union([z.string().startsWith("https://"), z.string().startsWith("lens://")]).optional(),
  /** must be a valid html, used to render in the body of the dialog */
  context: z.string().startsWith("<").endsWith(">").optional(),
  /** the text of the close button of the dialog */
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
