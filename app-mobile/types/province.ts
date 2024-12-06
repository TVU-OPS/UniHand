export type Province = {
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

export type ProvinceData = {
    data: Province[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        }
    }
}