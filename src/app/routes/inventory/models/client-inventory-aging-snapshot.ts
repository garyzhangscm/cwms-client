import { Client } from "../../common/models/client";
import { InventoryAgingSnapshotDetail } from "./inventory-aging-snapshot-detail";

export interface ClientInventoryAgingSnapshot {
     
    clientId: number; 
    client?: Client;
    
    averageAgeInDays: number; 
    averageAgeInWeeks: number; 
    inventoryAgingSnapshotDetails: InventoryAgingSnapshotDetail[];
}
