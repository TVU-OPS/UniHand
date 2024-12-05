import axiosConfig from "@/lib/axiosConfig";
import { Post, PostData, PostDetailData } from "@/types/post";

const postApi = {
  async getPosts(page: number, pageSize: number): Promise<PostData> {
    const res = await axiosConfig.get("/posts", {
      params: {
        sort: "createdAt:desc",
        populate: "*",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
      },
    });
    return res.data;
  },
  async fetchDetailPost(documentId: string) : Promise<PostDetailData> {
    const res = await axiosConfig.get(`/posts/${documentId}`, {
      params: {
        populate: "*",
      },
    });
    return res.data;
  },
};

export default postApi;
