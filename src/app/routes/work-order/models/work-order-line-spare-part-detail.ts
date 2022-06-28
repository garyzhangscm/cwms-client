import { Client } from "../../common/models/client";
import { InventoryStatus } from "../../inventory/models/inventory-status";
import { Item } from "../../inventory/models/item";
import { WorkOrderLineSparePart } from "./work-order-line-spare-part";

export interface WorkOrderLineSparePartDetail {
    
    id?: number;

    clientId?: number;
    client?: Client;

    itemId: number;
    item?: Item;

    inventoryStatusId: number;
    inventoryStatus?: InventoryStatus;
    
    
    quantity: number;
    openQuantity: number;
    inprocessQuantity: number;

}
