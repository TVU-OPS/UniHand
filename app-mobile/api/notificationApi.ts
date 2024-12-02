import axiosConfig from "@/lib/axiosConfig";
import { NotificationData } from "@/types/notification";

const notificationApi = {
    async getNotificationsBySupportOrganization(id: number, token: string) : Promise<NotificationData> {
    const res = await axiosConfig.get("/notifications", {
      params: {
        sort: "createdAt:desc",
        "filters[SupportOrganization]": id,
        "populate[SOSRequest][populate]": "*",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
//   async readNotification(id: number) {
//     const res = await axiosConfig.put(`/notifications/${id}`, {
//       read: true,
//     });
//     return res.data;
//   },
};

export default notificationApi;