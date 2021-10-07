import { Supplier } from "../../common/models/supplier";
import { InventoryStatus } from "../../inventory/models/inventory-status";
import { Item } from "../../inventory/models/item";
import { ItemFamily } from "../../inventory/models/item-family";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { QCRule } from "./qc-rule";

export interface QCRuleConfiguration {
    
    id?: number;
    warehouseId: number;

    warehouse: Warehouse;
    
    item?: Item;
    itemFamily?: ItemFamily;

    inventoryStatus?: InventoryStatus;

    supplierId?: number;

    supplier?: Supplier;
    
    qcRules: QCRule[];
}
