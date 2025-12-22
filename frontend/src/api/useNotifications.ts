import { useEffect, useState } from "react";
import { echo } from "../echo";
import { toast } from "react-toastify";
import api from '../api/axios'; 
import { type User } from "../contexts/AuthContext";

interface NotificationUser{
    id: number;
    name?: string;
    avatar_url?: string | null;
    email?: string;
}

export interface LiveNotification {
    user?: NotificationUser;
    id: number;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
}

const NOTIFICATIONS_API_URL = "/notifications"; 
const CLEAR_ALL_API_URL = "/notifications/clear-all"; 

export const useNotifications = (userId?: number, userRole?: string) => {
    const [notifications, setNotifications] = useState<LiveNotification[]>([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        if (!userId || !userRole) {
            setLoading(false);
            return;
        }
        const fetchInitialNotifications = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Use the authenticated API instance
                const res = await api.get(NOTIFICATIONS_API_URL);

                // Assuming the API returns an array of LiveNotification objects
                const data: LiveNotification[] = res.data; 

                // Ensure data structure integrity
                const initialItems: LiveNotification[] = data.map(n => ({
                    ...n,
                    id: n.id || Date.now() + Math.random(), // Ensure ID exists
                    read: n.read ?? false, // Ensure read status exists
                    type: n.type ?? 'initial',
                    created_at: n.created_at ?? new Date().toISOString(),
                    user: n.user ?? {
                        id: 0,
                        name: 'Unknown User',
                        avatar_url: '',
                    },
                }));
                
                setNotifications(initialItems);

            } catch (err: any) {
                console.error("Failed to fetch initial notifications:", err);
                // Check for 401/403 errors which often cause the 'Unexpected token <' error
                const status = err.response?.status;
                if (status === 401 || status === 403) {
                    setError("Authorization required. Please log in.");
                } else {
                    setError("Failed to load past notifications.");
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchInitialNotifications();

    const handleNewNotification = (payload: any, type: LiveNotification['type'], toastFunction: typeof toast.info) => {
        // Grab the actor user
        const actorUser = payload.notification?.activity_log?.user || {
            id: null,
            name: 'System',
            avatar_url: `https://ui-avatars.com/api/?name=System&background=cbd5e1&color=475569`
        };

        const message =
        payload.notification?.message || 
        payload.notification?.activity_log?.activity ||
        payload.message || 
        "New notification";

        const newNotification: LiveNotification = {
            user: {
                id: actorUser.id,
                name: actorUser.name,
                avatar_url: actorUser.avatar_url,
            },
            id: payload.id || Date.now() + Math.random(),
            message,
            type,
            read: false,
            created_at: payload.created_at || new Date().toISOString(),
        };

        toastFunction(type === 'private' ? newNotification.message : `[${type}] ${newNotification.message}`);
        setNotifications((prev) => [newNotification, ...prev]);
    };


        // --- Role channel ---
        const roleChannel = echo.private(`role.${userRole}`);
        roleChannel.listen(".RoleNotification", (payload: any) => {
            handleNewNotification(payload, "admin", toast.info);
        });

        // --- Private channel ---
        const privateChannel = echo.private(`user.${userId}`);
        privateChannel.listen(".NewNotification", (payload: any) => {
            handleNewNotification(payload, "private", toast.success);
        });

        // --- Public channel ---
        const publicChannel = echo.channel("public");
        publicChannel.listen(".NewNotification", (payload: any) => {
            handleNewNotification(payload, "public", toast.info);
        });

        // 3. CLEANUP
        return () => {
            echo.leave(`role.${userRole}`);
            echo.leave(`user.${userId}`);
            echo.leave("public");
        };

    }, [userId, userRole]); 


    // --- Asynchronous Clear Function (for the "Clear" button) ---
    const clearNotifications = async () => {
        if (isClearing) return;
        setIsClearing(true);
        try {
            // Use authenticated API to clear notifications on the server
            await api.post(CLEAR_ALL_API_URL);
            
            // Clear local state upon success
            setNotifications([]);
            toast.success("All notifications cleared.");

        } catch (err) {
            console.error("Error clearing notifications:", err);
            toast.error("Failed to clear notifications.");
        } finally {
            setIsClearing(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        unreadCount,
        loading,
        error,
        clear: clearNotifications,
        isClearing,
    };
};