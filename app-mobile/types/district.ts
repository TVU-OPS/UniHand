export type District = {
    id: number;
    documentId: string;
    Name: string;
    NameEn: string;
    FullName: string;
    FullNameEn: string;
    Latitude: string;
    Longitude: string;
    createdAt: string | null;
    updatedAt: string | null;
    publishedAt: string | null;
};

export type DistrictData = {
    data: District[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        }
    }
}