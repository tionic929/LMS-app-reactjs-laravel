// NotificationComponent.tsx
import React, { useEffect } from 'react';
import { echo } from '../echo';
import { toast } from 'react-toastify';

const NotificationComponent: React.FC = () => {
  useEffect(() => {
    // Subscribe to the 'notifications' channel
    const channel = echo.channel('notifications');

    // Listener for the broadcasted event
    const listener = (payload: any) => {
      // Extract message safely from queued or non-queued events
      const message =
        payload.message ||          // Non-queued event
        payload.data?.message ||   // Queued event
        payload.notification ||    // If you used 'notification' property
        JSON.stringify(payload);   // fallback

      // Debug logs (optional)
      console.log('[Notification] Received payload:', payload);
      console.log('[Notification] Parsed message:', message);

      // Display toast notification
      toast.info(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    };

    // Listen for the specific event
    channel.listen('.NewNotification', listener);

    // Cleanup on unmount
    return () => {
      channel.stopListening('.NewNotification');
      echo.leaveChannel('notifications');
    };
  }, []);

  // Component renders nothing; all work is via toast
  return null;
};

export default NotificationComponent;
