import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const notificationApi = createApiClient(serviceUrls.notifications);

export async function listNotificationsForUser(userId) {
  const res = await notificationApi.get(`/user/${userId}`);
  return res.data;
}
