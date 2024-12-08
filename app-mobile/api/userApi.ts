import axiosConfig from "@/lib/axiosConfig";
import { UserLogin, UserLoginResponse, UserRegister } from "@/types/user";

const userApi = {
  async login(data: UserLogin): Promise<UserLoginResponse> {
    const res = await axiosConfig.post("/auth/local", data);
    return res.data;
  },
  async register(data: UserRegister): Promise<UserLoginResponse> {
    const res = await axiosConfig.post("/auth/local/register", data);
    return res.data;
  },
};

export default userApi;
