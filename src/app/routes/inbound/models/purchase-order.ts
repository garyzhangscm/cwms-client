import { Client } from "../../common/models/client";
import { Supplier } from "../../common/models/supplier";
import { PurchaseOrderLine } from "./purchase-order-line";
import { PurchaseOrderStatus } from "./purchase-order-status";

export interface PurchaseOrder {
    
    id?: number;

    number?: String;

    warehouseId: number;
    clientId?: number;
    
    client?: Client;
    supplierId?: number;
    supplier?: Supplier;

    purchaseOrderLines: PurchaseOrderLine[];
    status: PurchaseOrderStatus;

    
    totalItemCount?: number;
    totalLineCount?: number;
    totalExpectedQuantity?: number;
    totalReceiptQuantity?: number;
    totalReceivedQuantity?: number;
}
