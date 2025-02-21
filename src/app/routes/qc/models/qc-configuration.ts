import { InventoryStatus } from "../../inventory/models/inventory-status";

export interface QcConfiguration {
 
    id?: number;

    warehouseId: number;
    qcPassInventoryStatus: InventoryStatus;
    qcFailInventoryStatus: InventoryStatus;

}
