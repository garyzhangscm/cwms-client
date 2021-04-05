import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { ReportType } from "./report-type.enum";

export interface ReportHistory {

    
    id: number;
    warehouseId: number;
    warehouse: Warehouse;
    
    printedDate: number[];
    printedUsername: string;

    name: string;
    description: string;


    type: ReportType;
    fileName: string;


}
