import { Company } from "../../warehouse-layout/models/company";
import { Warehouse } from "../../warehouse-layout/models/warehouse";

export interface BillableRequest {
    id: number;

    companyId: number;
    company: Company;
    warehouseId: number;
    warehouse: Warehouse;
    serviceName: string;
    webAPIEndpoint: string;
    requestMethod: string;
    parameters: string;
    requestBody: string;
    username: string;
    transactionId: string;
    rate: number;

    
    createdTime?: Date;


}
