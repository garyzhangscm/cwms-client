import { Client } from "../../common/models/client";
import { Order } from "./order";
import { OrderActivityType } from "./order-activity-type";
import { OrderLine } from "./order-line";
import { PickWork } from "./pick-work";
import { Shipment } from "./shipment";
import { ShipmentLine } from "./shipment-line";
import { ShortAllocation } from "./short-allocation";

export interface OrderActivity {
    
    id: number;

    warehouseId: number;
    
    number: string;
    transactionGroupId: string;

    activityDateTime: Date;

    username: string;
    rfCode: string;

    order: Order;
    
    orderLine: OrderLine;
    
    orderActivityType: OrderActivityType;


    quantity: number;
    
    orderNumber: string;
    orderLineNumber: string;
    oldOrderLineExpectedQuantity: number;
    newOrderLineExpectedQuantity: number;
    oldOrderLineOpenQuantity: number;
    newOrderLineOpenQuantity: number;
    oldOrderLineInProcessQuantity: number;
    newOrderLineInProcessQuantity: number;
    oldOrderLineShippedQuantity: number;
    newOrderLineShippedQuantity: number;

    
    shipment: Shipment;
    shipmentLine:ShipmentLine ;
    shipmentNumber: string;
    shipmentLineNumber: string;
    oldShipmentLineQuantity: number;
    newShipmentLineQuantity: number;
    oldShipmentLineOpenQuantity: number;
    newShipmentLineOpenQuantity: number;
    oldShipmentLineInProcessQuantity: number;
    newShipmentLineInProcessQuantity: number;
    oldShipmentLineLoadedQuantity: number;
    newShipmentLineLoadedQuantity: number;
    oldShipmentLineShippedQuantity: number;
    newShipmentLineShippedQuantity: number;


    pick: PickWork;
    pickNumber: string;
    oldPickQuantity: number;
    newPickQuantity: number;
    oldPickPickedQuantity: number;
    newPickPickedQuantity: number;

    // short allocation related quantity
    shortAllocation: ShortAllocation;
    oldShortAllocationQuantity: number;
    newShortAllocationQuantity: number;
    oldShortAllocationOpenQuantity: number;
    newShortAllocationOpenQuantity: number;
    oldShortAllocationInProcessQuantity: number;
    newShortAllocationInProcessQuantity: number;
    oldShortAllocationDeliveredQuantity: number;
    newShortAllocationDeliveredQuantity: number;

    clientId?: number;
    client?: Client;


}
