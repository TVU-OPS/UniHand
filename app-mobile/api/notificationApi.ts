import axiosConfig from "@/lib/axiosConfig";
import { NotificationData } from "@/types/notification";

const notificationApi = {
  async getNotificationsBySupportOrganization(
    id: number,
    token: string,
    page: number,
    pageSize: number,
    acceptedBy?: boolean | null,
    state?: boolean | null
  ): Promise<NotificationData> {
   
    const query: { [key: string]: any } =
    acceptedBy !== null
        ? { "filters[SOSRequest][AcceptedBy][$notNull]": acceptedBy }
        : {};

    if (state == null || state == false) {
      query["filters[$or][1][SOSRequest][State]"] = false;
      query["filters[$or][2][SOSRequest][State][$null]"] = true;
    }

    if (state !== null && state == true) {
      query["filters[$or][1][SOSRequest][State]"] = true;
      query["filters[$or][2][SOSRequest][State][$null]"] = false;
    }

    const params = {
      sort: "createdAt:desc",
      "filters[SupportOrganization]": id,
      "pagination[page]": page,
      "pagination[pageSize]": pageSize,
      "populate[SOSRequest][populate]": "*",
      ...query, 
    };

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
