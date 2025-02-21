import { QCInspectionRequestItemOption } from "./qc-inspection-request-item-option";
import { QCInspectionResult } from "./qc-inspection-result";
import { QCRule } from "./qc-rule";

export interface QCInspectionRequestItem {
    id?: number;

    qcRule: QCRule;

    qcInspectionResult: QCInspectionResult;

    qcInspectionRequestItemOptions: QCInspectionRequestItemOption[];

}
