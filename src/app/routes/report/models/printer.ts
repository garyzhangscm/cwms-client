import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { PrinterType } from "./printer-type";
import { PrintingJob } from "./printing-job";

export interface Printer {
    
    
    id?: number;

    warehouseId: number;
    warehouse?: Warehouse;


    name: string;
    description: string;
    printerType?: PrinterType;
    
    jobCount?: number;

    printingJobs?: PrintingJob[];

}
