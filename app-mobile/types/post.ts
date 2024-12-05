import { Image } from "./image";

export type Post = {
  id: number;
  documentId: string;
  Title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Content: string;
  Author: string;
  Image: Image;
};

export type PostData = {
  data: Post[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type PostDetailData = () => {
  data: Post;
  meta: {};
};
