import { District } from "./district";
import { Province } from "./province";
import { User } from "./user";
import { Ward } from "./ward";
import { Image } from "./image";

export type SupportOrganization = {
  id: number;
  documentId: string;
  Name: string;
  Representative: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Confirmed: boolean | null;
  NotificationEmail: string;
  Image: Image[];
  user: User;
  Province: Province;
  District: District;
  Ward: Ward;
  Description: string;
  PhoneNumber: string;
};

export type SupportOrganizationData = {
  data: SupportOrganization[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type SupportOrganizationCreate = {
  data: {
    Name: string;
    Representative: string;
    NotificationEmail: string;
    Image: number[];
    user: number;
    Province: number;
    District: number;
    Ward: number;
    Description: string;
    PhoneNumber: string;
  };
};
