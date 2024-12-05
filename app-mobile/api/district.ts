import axiosConfig from "@/lib/axiosConfig";
import { DistrictData } from "@/types/district";

const districtApi = {
  async getDistrictsByProvinceId(provinceId: string): Promise<DistrictData> {
    const res = await axiosConfig.get(`/districts`, {
      params: {
        "pagination[pageSize]": 100,
        "filters[Province]": provinceId,
        populate: "*",
      },
    });
    return res.data;
  },
};

export default districtApi;
