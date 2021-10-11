import { Inventory } from "../../inventory/models/inventory";
import { QCInspectionRequestItem } from "./qc-inspection-request-item";
import { QCInspectionResult } from "./qc-inspection-result";

export interface QcInspectionRequest {
    
    id: number;

    number: string;
    inventory: Inventory;

    qcInspectionResult: QCInspectionResult;

    qcUsername: string;

    qcTime: number[];
    qcInspectionRequestItems: QCInspectionRequestItem[];

}
