import { Warehouse } from "../../warehouse-layout/models/warehouse";

export interface SystemControlledNumber {
    id?: number;

    warehouseId: number;
    warehouse: Warehouse;

    variable: string;
    prefix: string;    
    postfix: string;

    length: number;
    currentNumber: number;
    nextNumber: string;
    rollover: boolean;

}
