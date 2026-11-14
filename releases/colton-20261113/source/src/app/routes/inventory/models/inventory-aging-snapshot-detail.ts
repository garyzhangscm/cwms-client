import { Inventory } from "./inventory";

export interface InventoryAgingSnapshotDetail {

    id?: number;
    
    inventory: Inventory;

    ageInDays: number;

    ageInWeeks: number;
    
    lpn: string;
    clientId?: number;
    quantity: number;

}
