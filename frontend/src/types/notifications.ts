// src/types/notifications.ts

// Define the available types (for styling)
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 1. Interface for a single Notification object
export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export interface SocketNotificationPayload {
  message: string;
  type: NotificationType;
  // Any other data the server sends
}

// 2. Interface for the Context's value (state + functions)
export interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationType, duration?: number) => void;
  removeNotification: (id: number) => void;
}