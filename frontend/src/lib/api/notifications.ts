import { fetchApi } from "../api";

export interface Notification {
  _id: string;
  userId: string;
  event: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: unknown;
  createdAt: string;
}

export async function getNotifications(page = 1, limit = 20): Promise<{ notifications: Notification[]; unreadCount: number }> {
  // Assuming a generic notifications endpoint will be /api/me/notifications or /api/notifications
  // Wait, let's use /api/me/notifications since they belong to the user
  return fetchApi(`/api/me/notifications?page=${page}&limit=${limit}`);
}

export async function markAsRead(id: string): Promise<void> {
  return fetchApi(`/api/me/notifications/${id}/read`, {
    method: "POST",
  });
}
