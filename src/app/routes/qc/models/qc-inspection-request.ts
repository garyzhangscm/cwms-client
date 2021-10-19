import { Inventory } from "../../inventory/models/inventory";
import { WorkOrderQcSample } from "../../work-order/models/work-order-qc-sample";
import { QCInspectionRequestItem } from "./qc-inspection-request-item";
import { QCInspectionResult } from "./qc-inspection-result";

export interface QcInspectionRequest {
    
    id: number;

    number: string;
    inventory: Inventory;

    workOrderQCSampleId: number;
    workOrderQCSample: WorkOrderQcSample;

    qcInspectionResult: QCInspectionResult;

    qcUsername: string;

    qcTime: number[];
    qcInspectionRequestItems: QCInspectionRequestItem[];

}
