// src/context/NotificationContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Notification, NotificationContextValue, NotificationType } from '../types/notifications';

// Provide a default value that matches the interface structure
const defaultContextValue: NotificationContextValue = {
  notifications: [],
  addNotification: () => {}, // empty function for default
  removeNotification: () => {}, // empty function for default
};

// Use the interface for createContext
const NotificationContext = createContext<NotificationContextValue>(defaultContextValue);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Use the interface for the custom hook return type
export const useNotification = (): NotificationContextValue => {
  return useContext(NotificationContext);
};