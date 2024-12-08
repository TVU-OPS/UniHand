export type User = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean | null;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export type UserLogin = {
  identifier: string;
  password: string;
};

export type UserRegister = {
  username: string;
  email: string;
  password: string;
};

export type UserLoginResponse = {
  jwt: string;
  user: User;
};
