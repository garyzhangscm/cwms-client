import { PrintingStrategy } from "./printing-strategy.enum";
import { Warehouse } from "./warehouse";

export interface WarehouseHoliday {
    
    id?: number;
    
    warehouse: Warehouse;
 
    holidayDate: Date;
    description: string;
}
