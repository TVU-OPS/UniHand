import { SosRequest } from "./sos-request";
import { SupportOrganization } from "./supportOrganization";

export type Notification = {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    SOSRequest: SosRequest;
    SupportOrganization: SupportOrganization
};

export type NotificationData = {
    data: Notification[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}