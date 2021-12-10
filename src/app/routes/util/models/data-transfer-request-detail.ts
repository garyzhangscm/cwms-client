import { DataTransferRequestStatus } from "./data-transfer-request-status";
import { DataTransferRequestTable } from "./data-transfer-request-table";

export interface DataTransferRequestDetail {
    
    id: number;
    
    sequence: number;
    description: String;
    tablesName: DataTransferRequestTable;
    status: DataTransferRequestStatus;
    fileUrl?: string;
}
