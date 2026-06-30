"use client";

import apiService from "@/app/api/apiService";

const normalizeListResponse = (response) => ({
  total: Number(response?.data?.total || 0),
  limit: Number(response?.data?.limit || 20),
  offset: Number(response?.data?.offset || 0),
  data: response?.data?.data || [],
});

export const fetchNotifications = async (params = {}) => {
  const response = await apiService.get("/notifications", { params });
  return normalizeListResponse(response);
};

export const fetchUnreadNotificationsCount = async () => {
  const response = await apiService.get("/notifications/unread-count");
  return response?.data?.data || { unread: 0, actionable: 0 };
};

export const markNotificationRead = async (id) => {
  const response = await apiService.patch(`/notifications/${id}/read`);
  return response?.data?.data;
};

export const markAllNotificationsRead = async () => {
  const response = await apiService.patch("/notifications/read-all");
  return response?.data?.data;
};

export const acknowledgeNotification = async (id, response = "acknowledged") => {
  const apiResponse = await apiService.post(`/notifications/${id}/acknowledge`, {
    response,
  });
  return apiResponse?.data?.data;
};

export const resolveNotification = async (id) => {
  const response = await apiService.patch(`/notifications/${id}/resolve`);
  return response?.data?.data;
};
