import { PrintPageOrientation } from "../../common/models/print-page-orientation.enum";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { ReportOrientation } from "./report-orientation.enum";
import { ReportType } from "./report-type.enum";

export interface ReportHistory {

    
    id: number;
    warehouseId: number;
    warehouse: Warehouse;
    
    printedDate: Date;
    printedUsername: string;

    
    description: string;


    type: ReportType;
    fileName: string;

    reportOrientation: ReportOrientation;

}
