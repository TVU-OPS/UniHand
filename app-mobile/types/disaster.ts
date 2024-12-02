import { DisasterType } from "./disasterType";

export type Disaster = {
    id: number;
    documentId: string;
    Name: string;
    Description: string;
    StartDate: string;
    EndDate: string;
    createdAt: string;
    DisasterType: DisasterType;
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