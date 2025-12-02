// src/components/NotificationToast.tsx

import React from 'react';
import { Alert, Snackbar, Box, IconButton, type AlertColor } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { type Notification } from '../../types/notifications'; // Your Notification interface
import { useNotification } from '../../contexts/NotificationContext';

interface NotificationToastProps {
  notification: Notification;
}

// Utility function to map our custom type to MUI's AlertColor type
const getAlertSeverity = (type: Notification['type']): AlertColor => {
  // Our types: 'success' | 'error' | 'warning' | 'info'
  // MUI types: 'success' | 'error' | 'warning' | 'info'
  return type as AlertColor; 
};


const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const { removeNotification } = useNotification();
  const severity = getAlertSeverity(notification.type);

  // Since this component is managed by the GlobalNotificationContainer, 
  // we use a simple Alert for display, not the full Snackbar component.
  return (
    <Box sx={{ width: '100%', mb: 1, minWidth: 300 }}>
      <Alert 
        severity={severity} // Applies color based on type
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => removeNotification(notification.id)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {notification.message}
      </Alert>
    </Box>
  );
};

export default NotificationToast;