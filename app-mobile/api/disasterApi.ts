import axiosConfig from "@/lib/axiosConfig";
import { DisasterData } from "@/types/disaster";

const disasterApi = {
    async getDisasters() : Promise<DisasterData> {
        const res = await axiosConfig.get("/disasters", {
            params: {
                sort: "createdAt:desc",
            },
        })
        return res.data;
    }

}

export default disasterApi;