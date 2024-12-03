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
    },
    async getOngoingDisasters() : Promise<DisasterData> {
        const res = await axiosConfig.get("/disasters", {
            params: {
                sort: "createdAt:desc",
                filters: {
                    $or: [
                        { EndDate: { $null: true } },
                        { EndDate: { $gte: new Date().toISOString() } }
                    ],
                    StartDate: { $lte: new Date().toISOString() },
                },
                populate: "*",
            },
        })
        return res.data;
    }
}

export default disasterApi;