import axiosConfig from "@/lib/axiosConfig";
import { ProvinceData } from "@/types/province";

const provinceApi = {
  async getProvinces(): Promise<ProvinceData> {
    const res = await axiosConfig.get("/provinces", {
      params: {
        "pagination[pageSize]": 100,
      },
    });
    return res.data;
  },
};

export default provinceApi;
