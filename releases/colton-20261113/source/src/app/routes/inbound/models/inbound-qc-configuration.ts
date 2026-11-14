import { Supplier } from "../../common/models/supplier";
import { InventoryStatus } from "../../inventory/models/inventory-status";
import { Item } from "../../inventory/models/item";
import { ItemFamily } from "../../inventory/models/item-family";
import { Company } from "../../warehouse-layout/models/company";
import { Warehouse } from "../../warehouse-layout/models/warehouse";

export interface InboundQcConfiguration {
    
    id?: number;

    
    supplierId?: number;
    supplier?: Supplier;

    itemId?: number;
    item?: Item;
    itemFamilyId?: number;
    itemFamily?: ItemFamily;


    warehouseId?: number;
    warehouse?: Warehouse;
    companyId: number;
    company?: Company;
    
    qcQuantityPerReceipt?: number;
    qcPercentage?: number;
    fromInventoryStatusId?: number;
    fromInventoryStatus?: InventoryStatus;
    toInventoryStatusId?: number;
    toInventoryStatus?: InventoryStatus;

}
