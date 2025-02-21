import { DataInitialRequestStatus } from "./data-initial-request-status.enum";

export interface DataInitialRequest {
    id?: number;

    companyName: string;
    companyCode: string;
    warehouseName: string;
    adminUserName: string;
    requestUsername: string;
    
    status: DataInitialRequestStatus;
}
