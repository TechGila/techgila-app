import { createContext } from "react";

export type Notification = {
  id: string;
  title: string;
  description?: string;
  read?: boolean;
  timestamp?: string;
};

export type NotificationsContextType = {
  notifications: Notification[];
  addNotification: (
    n: Omit<Notification, "id" | "timestamp" | "read">
  ) => string;
  markRead: (id: string) => void;
  clearAll: () => void;
};

export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);
