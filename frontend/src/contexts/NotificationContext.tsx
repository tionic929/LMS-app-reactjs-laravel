import React, { createContext, useState, useContext, type ReactNode } from 'react';
import type { Notification, NotificationContextValue, NotificationType } from '../types/notifications';

interface ExtendedNotificationContextValue extends NotificationContextValue {
  refreshTrigger: number;
  triggerRefresh: () => void;
}
// Provide a default value that matches the interface structure
const defaultContextValue: ExtendedNotificationContextValue = {
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
};

// Use the interface for createContext
const NotificationContext = createContext<ExtendedNotificationContextValue>(defaultContextValue);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function signature now explicitly types all parameters
  const addNotification = (
    message: string,
    type: NotificationType = 'info', // default value for type
    duration: number = 5000         // default value for duration
  ) => {
    const id = Date.now() + Math.random();
    // Ensure the new object matches the Notification interface
    const newNotification: Notification = { id, message, type };

    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => removeNotification(id), duration);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{
       notifications, 
       addNotification, 
       removeNotification,
       refreshTrigger,
       triggerRefresh
       }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Use the interface for the custom hook return type
export const useNotification = (): ExtendedNotificationContextValue => {
  return useContext(NotificationContext);
};