import { useEffect, useState } from "react";
import { echo } from "../echo";
import { toast } from "react-toastify";

export interface LiveNotification {
  id?: number;
  message: string;
  type?: string;
  created_at?: string;
}

export const useNotifications = (userId?: number, userRole?: string) => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  useEffect(() => {
    if (!userId || !userRole) return;

    // --- Role channel ---
    const roleChannel = echo.private(`role.${userRole}`);
    roleChannel.listen(".RoleNotification", (payload: any) => {
      const message =
        payload.message ||
        payload.data?.message ||
        payload.notification ||
        "New role notification";

      toast.info(`[${userRole}] ${message}`);
      setNotifications((prev) => [{ message, type: "role" }, ...prev]);
    });

    // --- Private channel ---
    const privateChannel = echo.private(`user.${userId}`);
    privateChannel.listen(".NewNotification", (payload: any) => {
      const message =
        payload.message ||
        payload.data?.message ||
        payload.notification ||
        "New private notification";

      toast.success(message);
      setNotifications((prev) => [{ message, type: "private" }, ...prev]);
    });

    // --- Public channel ---
    const publicChannel = echo.channel("public");
    publicChannel.listen(".NewNotification", (payload: any) => {
      const message =
        payload.message ||
        payload.data?.message ||
        payload.notification ||
        "New public notification";

      toast.info(`[Public] ${message}`);
      setNotifications((prev) => [{ message, type: "public" }, ...prev]);
    });

    return () => {
      echo.leave(`role.${userRole}`);
      echo.leave(`user.${userId}`);
      echo.leave("public");
    };
  }, [userId, userRole]);

  return {
    notifications,
    unreadCount: notifications.length,
    clear: () => setNotifications([]),
  };
};
