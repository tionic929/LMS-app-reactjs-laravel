// src/hooks/useSocketNotifications.ts

import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotification } from '../contexts/NotificationContext'; 
import type { SocketNotificationPayload, NotificationType } from '../types/notifications';

// Persistent Socket instance (outside the hook to maintain connection across re-renders)
const SOCKET_SERVER_URL = 'http://localhost:3000';
// Define the socket instance with proper typing if necessary, or just use `any` for simplicity
const socket: Socket = io(SOCKET_SERVER_URL, { autoConnect: false }); 

const useSocketNotifications = () => {
  const { addNotification } = useNotification();

  // Memoized callback for the notification logic
  const handleNewNotification = useCallback((data: SocketNotificationPayload) => {
    // Basic validation to ensure data matches expected type structure
    if (typeof data.message === 'string' && ['info', 'success', 'warning', 'error'].includes(data.type)) {
      addNotification(data.message, data.type as NotificationType);
      console.log(`[CLIENT] Received live notification: ${data.message}`);
    } else {
      console.error("[CLIENT] Received malformed socket data:", data);
    }
  }, [addNotification]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      console.log(`[CLIENT] Attempting to connect to ${SOCKET_SERVER_URL}`);
    }
    
    // 1. Listener for the 'new_notification' event (from API/Recurring Events)
    socket.on('new_notification', handleNewNotification);

    // 2. Listener for the initial 'status' message
    socket.on('status', handleNewNotification);

    // 3. Optional: Connection status listeners
    socket.on('connect_error', (err) => {
      console.error(`[SOCKET ERROR] Connection failed: ${err.message}`);
    });
    
    // Cleanup function: remove listeners when the hook unmounts
    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('status', handleNewNotification);
      // We generally leave the socket connected unless the component is truly the last thing using it.
      // socket.disconnect(); 
    };
    
    // Dependencies: handleNewNotification (which depends on addNotification)
  }, [handleNewNotification]);

  return socket; // You can return the socket instance if other parts of the app need to send data
};

export default useSocketNotifications;