import axiosConfig from "@/lib/axiosConfig";
import { SupportOrganizationData } from "@/types/supportOrganization";

const supportOrganizationApi = {
    async getSupportOrganizationByUserId(userId: number) : Promise<SupportOrganizationData> {
        const res = await axiosConfig.get("/support-organizations",
            {
                params: {
                    populate: '*',
                    "filters[user]" : userId
                },
            }
        );
        console.log(res.request);
        return res.data;
    }
}
export default supportOrganizationApi;