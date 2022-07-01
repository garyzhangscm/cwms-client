import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { PrinterType } from "./printer-type";

export interface Printer {
    
    
    id?: number;

    warehouseId: number;
    warehouse?: Warehouse;


    name: string;
    description: string;
    printerType?: PrinterType;

}
