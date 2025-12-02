import { useEffect, useRef } from 'react'; // 💡 Import useRef
import { io, Socket } from 'socket.io-client';
import { useNotification } from '../contexts/NotificationContext'; 
import { useAuth } from '../contexts/AuthContext'; 
import type { SocketNotificationPayload, NotificationType } from '../types/notifications';

const SOCKET_SERVER_URL = 'http://localhost:3000'; 

// Function to handle socket ready confirmation (no state change)
const handleSocketReady = (data: any) => {
    console.log(`[CLIENT] Socket Handshake Complete: ${data.message}`);
};

const useSocketNotifications = () => {
    const { user } = useAuth();
    // Get the current, potentially unstable, addNotification function
    const { addNotification, triggerRefresh } = useNotification();
    
    // 1. Use a ref to store the latest addNotification function reference.
    // This allows us to use the function inside useEffect without adding it to dependencies.
    const addNotificationRef = useRef(addNotification); 
    const triggerRefreshRef = useRef(triggerRefresh);

    // 2. Update the ref on every render. This ensures the ref always points to 
    // the correct, latest version of the addNotification function.
    useEffect(() => {
        addNotificationRef.current = addNotification;
        triggerRefreshRef.current = triggerRefresh;
    }, [addNotification, triggerRefresh]);


    // 3. The main effect for socket management.
    useEffect(() => {
        const userId = user?.id;
        const userRole = user?.role;

        if (!userId) { 
            console.log('[CLIENT] Waiting for authenticated user ID...');
            return;
        }

        // Handler must use the ref to call the latest function
        const handleNewNotification = (data: SocketNotificationPayload) => {
            if (typeof data.message === 'string' && ['info', 'success', 'warning', 'error'].includes(data.type)) {
                
                // 🛑 CRITICAL FIX: Calling the function via the stable ref pointer 🛑
                addNotificationRef.current(data.message, data.type as NotificationType); 
                triggerRefreshRef.current();
                console.log(`[CLIENT] Received live notification: ${data.message}`);
            } else {
                console.error("[CLIENT] Received malformed socket data:", data);
            }
        };

        const socket: Socket = io(SOCKET_SERVER_URL, { 
            query: { userId, userRole },
            autoConnect: true 
        });
        
        console.log(`[CLIENT] Attempting to connect for user ID: ${userId}`);
        
        socket.on('new_notification', handleNewNotification); 
        socket.on('socket_ready', handleSocketReady); 

        socket.on('connect_error', (err) => {
            console.error(`[SOCKET ERROR] Connection failed: ${err.message}`);
        });
        
        return () => {
            console.log(`[CLIENT] Disconnecting socket for user ID: ${userId} (Cleanup complete)`);
            socket.off('new_notification', handleNewNotification);
            socket.off('socket_ready', handleSocketReady);
            socket.disconnect(); 
        };
        
        // 🛑 DEPENDENCY FIX: Only depends on stable user identity. 
        // addNotification is safely accessed via the ref (addNotificationRef.current).
        // only reconnects to the socket whenever the user id and user role changes.
    }, [user?.id, user?.role]); 
};

export default useSocketNotifications;