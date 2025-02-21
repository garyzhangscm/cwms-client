import { InventoryStatus } from "./inventory-status";
import { Item } from "./item";
import { ItemPackageType } from "./item-package-type";

export interface InventorySnapshotDetail {
    id: number;  
    item: Item;
    itemPackageType: ItemPackageType;
    inventoryStatus: InventoryStatus;
    locationGroupTypeId: number;
    locationGroupTypeName: string;
    quantity: number;


}
