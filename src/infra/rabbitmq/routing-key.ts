export enum RoutingKeysEnum {
  NOTIFICATION_SEND_EMAIL = 'notification.send-email',
}

export const ROUTING_KEYS = Object.values(RoutingKeysEnum);
export type RoutingKey = (typeof ROUTING_KEYS)[number];
