import { InventorySnapshotDetail } from "./inventory-snapshot-detail";
import { InventorySnapshotStatus } from "./inventory-snapshot-status.enum";
import { InventorySnapshotSummaryGroupBy } from "./inventory-snapshot-summary-group-by";

export interface InventorySnapshotSummary {

    
    batchNumber: string;
    
    completeTime: Date;

    groupBy: InventorySnapshotSummaryGroupBy;
    groupByValue: string;


    inventoryQuantity: number; 

}
