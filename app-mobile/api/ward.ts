import axiosConfig from "@/lib/axiosConfig";

const wardApi = {
  async getWardsByDistrictId(districtId: string) {
    const res = await axiosConfig.get(`/wards`, {
      params: {
        "pagination[pageSize]": 100,
        "filters[District]": districtId,
        populate: "*",
      },
    });
    return res.data;
  },
};

export default wardApi;
