import { PrintPageOrientation } from "../../common/models/print-page-orientation.enum";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { ReportType } from "./report-type.enum";
import { ReportOrientation } from "./report-orientation.enum";

export interface ReportHistory {

    
    id: number;
    warehouseId: number;
    warehouse: Warehouse;
    
    printedDate: number[];
    printedUsername: string;

    
    description: string;


    type: ReportType;
    fileName: string;

    reportOrientation: ReportOrientation;

}
