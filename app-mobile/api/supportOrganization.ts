import axiosConfig from "@/lib/axiosConfig";
import { SupportOrganizationCreate, SupportOrganizationData } from "@/types/supportOrganization";

const supportOrganizationApi = {
  async getSupportOrganizationByUserId(
    userId: number
  ): Promise<SupportOrganizationData> {
    const res = await axiosConfig.get("/support-organizations", {
      params: {
        populate: "*",
        "filters[user]": userId,
      },
    });
    return res.data;
  },

  async createSupportOrganization(data: SupportOrganizationCreate): Promise<SupportOrganizationData> {
    const res = await axiosConfig.post("/support-organizations", data);
    return res.data;
  },
};
export default supportOrganizationApi;
