import { Item } from "../../inventory/models/item";
import { Order } from "../../outbound/models/order";
import { OrderLine } from "../../outbound/models/order-line";

export interface CustomerReturnOrderLine {
    
    id?: number;

    number: string;

    warehouseId: number; 

    itemId?: number;
    item?: Item;

    expectedQuantity: number;
    receivedQuantity: number; 

    overReceivingQuantity: number;
    overReceivingPercent: number;

    qcQuantity: number;
    qcPercentage: number;
    qcQuantityRequested: number;
    
    outboundOrderLineId?: number; 
    outboundOrderLine?: OrderLine; 
    outboundOrderNumber?: string;
    outboundOrder?: Order;
}
