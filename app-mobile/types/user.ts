export type User = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export type UserLogin = {
  identifier: string;
  password: string;
};

export type UserLoginResponse = {
  jwt: string;
  user: User;
};
