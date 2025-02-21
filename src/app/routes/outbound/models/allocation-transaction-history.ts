import { Item } from "../../inventory/models/item";
import { WorkOrder } from "../../work-order/models/work-order";
import { ShipmentLine } from "./shipment-line";

export interface AllocationTransactionHistory {
    
    id: number;

    warehouseId: number;
    
    number: string;
    transactionGroupId: string;


    orderNumber: string;

    shipmentLine: ShipmentLine;


    workOrderNumber: string;
    workOrderId: number;
    workOrder: WorkOrder;
    
    itemName: string;
    itemId: number;
    item: Item;

    locationName: string;
    locationId: number;
    location: Location;

    totalRequiredQuantity: number;
    currentRequiredQuantity: number;
    totalInventoryQuantity: number;
    totalAvailableQuantity: number;
    totalAllocatedQuantity: number;
    alreadyAllocatedQuantity: number;


    isSkippedFlag: boolean;
    isAllocatedByLPNFlag: boolean;
    isRoundUpFlag: boolean;
    
    username: string;
    message: string;
}
