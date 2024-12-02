import { District } from "./district";
import { Province } from "./province";
import { Ward } from "./ward";

export type CreateSosRequest = {
  data: {
    FullName: string;
    RequestDescription: string;
    PeopleCount: number;
    NeedWater: boolean;
    NeedFood: boolean;
    NeedMedical: boolean;
    PhoneNumber: string;
    Location: {
      lat: number;
      lng: number;
    };
    Disaster: number;
  };
};

export type SosRequest = {
  id: number;
  documentId: string;
  FullName: string;
  RequestDescription: string;
  PeopleCount: number;
  NeedWater: boolean;
  NeedFood: boolean;
  NeedMedical: boolean;
  Location: {
    lat: number;
    lng: number;
  };
  PhoneNumber: string;
  Email: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  State: string | null;
  Road: string | null;
  Amenity: string | null;
  Province: Province;
  District: District;
  Ward: Ward;
};
