// src/components/common/NotificationDisplay.tsx

import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

// Define basic styles for the toast based on the notification type
const getToastStyle = (type: string) => {
    switch (type) {
        case 'success':
            return { backgroundColor: '#4CAF50', color: 'white' };
        case 'warning':
            return { backgroundColor: '#ff9800', color: 'white' };
        case 'error':
            return { backgroundColor: '#f44336', color: 'white' };
        case 'info':
        default:
            return { backgroundColor: '#2196F3', color: 'white' };
    }
};

const NotificationDisplay: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    // The primary container is fixed to stay in the top-right corner
    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000, // Very high z-index to ensure visibility
        maxWidth: '350px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    };

    const notificationBaseStyle: React.CSSProperties = {
        padding: '15px',
        borderRadius: '5px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        transition: 'opacity 0.3s ease-in-out',
        fontWeight: 'bold',
        fontSize: '14px',
    };

    return (
        <div style={containerStyle}>
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    // Apply type-specific styles and base styles
                    style={{
                        ...notificationBaseStyle,
                        ...getToastStyle(notification.type),
                    }}
                    // Click to dismiss immediately (in addition to the timeout)
                    onClick={() => removeNotification(notification.id)}
                >
                    {/* Display the message content */}
                    {notification.message}
                    <span style={{ marginLeft: '10px', opacity: 0.8 }}>&times;</span>
                </div>
            ))}
        </div>
    );
};

export default NotificationDisplay;