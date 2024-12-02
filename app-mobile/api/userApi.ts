import axiosConfig from "@/lib/axiosConfig";
import { UserLogin, UserLoginResponse } from "@/types/user";

const userApi = {
  async login(data: UserLogin): Promise<UserLoginResponse> {
    const res = await axiosConfig.post("/auth/local", data);
    return res.data;
  },
};

export default userApi;
