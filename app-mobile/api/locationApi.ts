import axiosConfig from "@/lib/axiosConfig";
import { Location, LocationData } from "@/types/location";

const locationApi = {
  async convertLocation(lat: string, lng: string): Promise<LocationData> {
      const response = await axiosConfig.post(`/convert-location`, {
          data: {
              Location: {
                  lat: lat,
                  lng: lng,
        },
      },
    });
    return response.data;
  },
};

export default locationApi;
