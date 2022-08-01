import { Item } from "../../inventory/models/item";

export interface PurchaseOrderLine {
    id?: number;

    number: String;

    warehouseId: number;
 

    itemId: number;
    item?: Item;

    expectedQuantity: number;
    receiptQuantity: number;
    receivedQuantity: number;
 
}
