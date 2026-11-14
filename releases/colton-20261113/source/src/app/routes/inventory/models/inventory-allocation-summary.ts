import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location";
import { InventoryStatus } from "./inventory-status";
import { Item } from "./item";

export interface InventoryAllocationSummary {
    
    warehouseId: number;

    locationId: number;
    location: WarehouseLocation;

    item: Item;
    totalQuantity: number;
    allocatedQuantity: number;
    availableQuantity: number;

    inventoryStatus: InventoryStatus;
}
