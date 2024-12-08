import axiosConfig from "@/lib/axiosConfig";
import { CreateSosRequest, SosRequest } from "@/types/sos-request";

const sosRequestApi = {
  async createSosRequest(data: CreateSosRequest): Promise<any> {
    const res = await axiosConfig.post("/sos-requests", data);
    return res;
  },
  async acceptSosRequest(
    acceptedBy: number,
    documentId: string,
    token: string
  ): Promise<any> {
    const res = await axiosConfig.put(
      `/sos-requests/${documentId}`,
      {
        data: {
          AcceptedBy: acceptedBy,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  },
  async doneSosRequest(
    acceptedBy: number,
    documentId: string,
    token: string
  ): Promise<any> {
    const res = await axiosConfig.put(
      `/sos-requests/${documentId}`,
      {
        data: {
          AcceptedBy: acceptedBy,
          State: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  },
  async getSosRequest(documentId: string, token: string): Promise<SosRequest> {
    const res = await axiosConfig.get(`/sos-requests/${documentId}?populate=*`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};

export default sosRequestApi;