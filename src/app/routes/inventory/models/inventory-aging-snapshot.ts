import { ClientInventoryAgingSnapshot } from "./client-inventory-aging-snapshot";
import { InventoryAgingSnapshotStatus } from "./inventory-aging-snapshot-status";

export interface InventoryAgingSnapshot {

    id?: number;
    
    number: string;

    clientInventoryAgingSnapshots: ClientInventoryAgingSnapshot[];
    
    startTime: Date;
    completeTime: Date;
    
    status: InventoryAgingSnapshotStatus;

}
