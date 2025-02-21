import { QCInspectionResult } from "../../qc/models/qc-inspection-result";
import { WorkOrderQcSample } from "./work-order-qc-sample";

export interface WorkOrderQcResult {
    
    id: number;

    number: string;
    warehouseId: number;

    workOrderQCSample: WorkOrderQcSample;


    qcInspectionResult: QCInspectionResult;

    qcUsername: string;

    qcRFCode: string;
    qcTime: Date;
}
