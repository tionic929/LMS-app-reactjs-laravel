// src/components/GlobalNotificationContainer.tsx (Updated for MUI)

import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import NotificationToast from './toast/NotificationToast';
import { Stack, Box } from '@mui/material'; // Using MUI Stack for layout

const GlobalNotificationContainer: React.FC = () => {
  const { notifications } = useNotification();

  // Position this container fixed in the viewport (Top Right)
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1400, // MUI default zIndex for snackbar is 1400
        maxWidth: 350,
      }}
    >
      {/* Stack manages vertical spacing (spacing={1} means 8px default spacing) */}
      <Stack spacing={1}> 
        {notifications.map(notification => (
          <NotificationToast 
            key={notification.id} 
            notification={notification}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default GlobalNotificationContainer;