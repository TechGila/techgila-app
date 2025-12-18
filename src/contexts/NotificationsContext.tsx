import React, { useContext, useState, useCallback, useEffect } from "react";
import {
  NotificationsContext,
  Notification,
  NotificationsContextType,
} from "./notificationsContextCore";

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      const id = `n_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const notification: Notification = {
        id,
        title: n.title,
        description: n.description,
        read: false,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
      return id;
    },
    []
  );

  // allow window-based dispatch for simple interop from pages
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce?.detail?.title) {
        addNotification({
          title: ce.detail.title,
          description: ce.detail.description,
        });
      }
    };
    window.addEventListener("notification:add", handler as EventListener);
    return () =>
      window.removeEventListener("notification:add", handler as EventListener);
  }, [addNotification]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, markRead, clearAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
