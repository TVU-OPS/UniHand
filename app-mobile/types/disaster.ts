import { DisasterType } from "./disasterType";
import { Province } from "./province";

export type Disaster = {
    id: number;
    documentId: string;
    Name: string;
    Description: string;
    StartDate: string;
    EndDate: string;
    createdAt: string;
    DisasterType?: DisasterType;
    Provinces?: Province[];
}

export type DisasterData = {
    data: Disaster[];
    meta: {
        pagination: {
            page: number,
            pageSize: number,
            pageCount: number,
            total: number
        }
    }
}