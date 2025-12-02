import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../contexts/NotificationContext'; 

// Mock Types and Hook for runnable code structure
interface Notification {
    id: number;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
}

// Define basic Tailwind classes for the toast based on the notification type
const getToastClasses = (type: string): string => {
    switch (type) {
        case 'success':
            return 'bg-green-600 text-white';
        case 'warning':
            return 'bg-yellow-600 text-white';
        case 'error':
            return 'bg-red-600 text-white';
        case 'info':
        default:
            return 'bg-blue-600 text-white';
    }
};

// Base classes applied to all notifications for consistent look
const notificationBaseClasses = 'p-4 rounded-lg shadow-xl cursor-pointer font-bold text-sm transition-opacity';

// --- ANIMATION WRAPPER COMPONENT ---

interface AnimatedToastProps {
    notification: Notification;
    onDismiss: (id: number) => void;
}

const ANIMATION_DURATION_MS = 300; // Matches the CSS transition duration

const AnimatedToast: React.FC<AnimatedToastProps> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);
    const { message, type, id } = notification;

    const handleRemove = useCallback(() => {
        // 1. Start the exit animation
        setIsExiting(true);

        // 2. Wait for the animation to finish, then call the context removal function
        setTimeout(() => {
            onDismiss(id);
        }, ANIMATION_DURATION_MS);
    }, [id, onDismiss]);

    // Apply entrance animation class by default, and switch to exit animation class when dismissing
    const toastClasses = `${notificationBaseClasses} ${getToastClasses(type)} toast-enter ${isExiting ? 'toast-exit' : ''}`;

    return (
        <div
            key={id}
            className={toastClasses}
            onClick={handleRemove}
        >
            {message}
            <span className="ml-3 opacity-80 font-normal">&times;</span>
        </div>
    );
};

// --- MAIN DISPLAY COMPONENT ---

const NotificationDisplay: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    const containerClasses = 'fixed top-5 left-1/2 transform -translate-x-1/2 z-[2000] w-full max-w-sm flex flex-col space-y-3 px-3 box-border';
    return (
        <>
            <style>
                {`
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(-30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @keyframes slideOut {
                        from { opacity: 1; transform: translateY(0); }
                        to { opacity: 0; transform: translateY(-30px); }
                    }

                    .toast-enter {
                        animation: slideIn 0.3s forwards;
                    }

                    .toast-exit {
                        animation: slideOut 0.3s forwards;
                    }
                `}
            </style>
            <div className={containerClasses}>
                {notifications.map((notification) => (
                    <AnimatedToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={removeNotification}
                    />
                ))}
            </div>
        </>
    );
};

export default NotificationDisplay;