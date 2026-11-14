import { Receipt } from "../../inbound/models/receipt";
import { Inventory } from "../../inventory/models/inventory";
import { Item } from "../../inventory/models/item";
import { WorkOrder } from "../../work-order/models/work-order";
import { WorkOrderQcSample } from "../../work-order/models/work-order-qc-sample";
import { QCInspectionRequestItem } from "./qc-inspection-request-item";
import { QcInspectionRequestType } from "./qc-inspection-request-type";
import { QCInspectionResult } from "./qc-inspection-result";

export interface QcInspectionRequest {
    
    id?: number;

    number: string;
    inventory?: Inventory;
    inventories: Inventory[];
    allInventories?: Inventory[];
    warehouseId: number;

    workOrderQCSampleId?: number;
    workOrderQCSample?: WorkOrderQcSample;

    qcInspectionResult: QCInspectionResult;

    qcUsername?: string;

    qcTime?: Date;
    qcInspectionRequestItems: QCInspectionRequestItem[];

    
     item?: Item;

     workOrderId?: number;
     workOrder?: WorkOrder;

     receiptId?: number;
     receipt?: Receipt;

     type: QcInspectionRequestType;

     qcQuantity?: number;
     documentUrls: string;

}
