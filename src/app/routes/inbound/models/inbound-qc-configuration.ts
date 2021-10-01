import { Supplier } from "../../common/models/supplier";
import { Item } from "../../inventory/models/item";
import { Company } from "../../warehouse-layout/models/company";
import { Warehouse } from "../../warehouse-layout/models/warehouse";

export interface InboundQcConfiguration {
    
    id?: number;

    
    supplierId?: number;
    supplier?: Supplier;

    itemId?: number;
    item?: Item;


    warehouseId?: number;
    warehouse?: Warehouse;
    companyId: number;
    company?: Company;
    
    qcQuantityPerReceipt?: number;
    qcPercentage?: number;
}
