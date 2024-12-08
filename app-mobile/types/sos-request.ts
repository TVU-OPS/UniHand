import { Disaster } from "./disaster";
import { District } from "./district";
import { Image } from "./image";
import { Province } from "./province";
import { SupportOrganization } from "./supportOrganization";
import { FileUpload } from "./upload";
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
    Location?: {
      lat: string;
      lng: string;
    };
    DamageImage?: number[] | string[];
    Disaster: number;
    Amenity?: string;
    Road?: string;
    AudioFile?: number[] | string[];
    Province?: number;
    District?: number;
    Ward?: number;
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
  AudioFile: FileUpload | null;
  DamageImage: Image[] | null;
  PhoneNumber: string;
  Email: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  State: boolean;
  Road: string | null;
  Amenity: string | null;
  Province: Province;
  District: District;
  Ward: Ward;
  Disaster: Disaster;
  AcceptedBy: SupportOrganization | null;
};
