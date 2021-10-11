import { QCInspectionResult } from "./qc-inspection-result";
import { QCRuleItem } from "./qc-rule-item";

export interface QCInspectionRequestItemOption {
    id: number;

    qcRuleItem: QCRuleItem;
    
    qcInspectionResult: QCInspectionResult;

}
