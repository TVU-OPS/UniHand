import axiosConfig from "@/lib/axiosConfig";
import { NotificationData } from "@/types/notification";

const notificationApi = {
  async getNotificationsBySupportOrganization(
    id: number,
    token: string,
    state?: boolean | null
  ): Promise<NotificationData> {
    // Tạo query dựa trên state
    const query =
      state !== null
        ? {"filters[SOSRequest][AcceptedBy][$notNull]": state }
        : {};

    // Gộp params và query
    const params = {
      sort: "createdAt:desc",
      "filters[SupportOrganization]": id,
      // "filters[SOSRequest][AcceptedBy][$notNull]": true,
      "populate[SOSRequest][populate]": "*",
      ...query, // Thêm điều kiện từ query vào params
    };

    // Gửi request với axios
    const res = await axiosConfig.get("/notifications", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },
};

export default notificationApi;
