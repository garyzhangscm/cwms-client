import { Company } from "../../warehouse-layout/models/company";
import { DataTransferRequestDetail } from "./data-transfer-request-detail";
import { DataTransferRequestStatus } from "./data-transfer-request-status";
import { DataTransferRequestType } from "./data-transfer-request-type";

export interface DataTransferRequest {
    
    id: number;

    companyId: number;
    number: String;
    company?: Company;
    zipFileUrl?: string;

    description: String;

    status: DataTransferRequestStatus;

    type: DataTransferRequestType;


    dataTransferRequestDetails: DataTransferRequestDetail[];
}
