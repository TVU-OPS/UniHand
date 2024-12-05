import axiosConfig from "@/lib/axiosConfig";
import { FileUpload } from "@/types/upload";

const uploadApi = {
  async uploadAudioFiles(filesUrl: string[]): Promise<FileUpload[]> {
    const formData = new FormData();
    filesUrl.forEach((filesUrl) => {
      // Lấy tên file từ URI
      const fileName = filesUrl.split("/").pop();
      const type = fileName?.split(".").pop();
      // Đóng gói file vào FormData
      formData.append("files", {
        uri: filesUrl,
        name: fileName || "recording.mp4",
        type: `audio/${type}`, // Hoặc loại MIME phù hợp
      });
    });

    const res = await axiosConfig.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async uploadImageFiles(filesUrl: string[]): Promise<FileUpload[]> {
    const formData = new FormData();
    filesUrl.forEach((filesUrl) => {
      // Lấy tên file từ URI
      const fileName = filesUrl.split("/").pop();
      const type = fileName?.split(".").pop();
      // Đóng gói file vào FormData
      formData.append("files", {
        uri: filesUrl,
        name: fileName || "image",
        type: `image/${type}`, // Hoặc loại MIME phù hợp
      });
    });

    const res = await axiosConfig.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};

export default uploadApi;
