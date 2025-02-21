import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { PrinterType } from "./printer-type";
import { ReportHistory } from "./report-history";

export interface PrintingRequest {
    
    id: number;

 
    reportHistory: ReportHistory;

    printerName: string;

    copies: number; 

}
