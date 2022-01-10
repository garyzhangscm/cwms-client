import { Item } from "../../inventory/models/item";
import { MasterProductionScheduleLine } from "./master-production-schedule-line";

export interface MasterProductionSchedule {
    
    id?: number;
    warehouseId: number;

    number: string;
    description: string;
    
    cutoffDate: number[];


    itemId?: number;
    item?: Item;
    
    totalQuantity: number;
    masterProductionScheduleLines: MasterProductionScheduleLine[];

}
