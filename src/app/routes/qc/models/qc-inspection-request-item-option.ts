import { QCInspectionResult } from "./qc-inspection-result";
import { QCRuleItem } from "./qc-rule-item";

export interface QCInspectionRequestItemOption {
    id?: number;

    qcRuleItem: QCRuleItem;
    
    qcInspectionResult: QCInspectionResult;

    booleanValue?: boolean;
    value?: string;  // used to convert the boolean value into a string so we can show 3 state radio button

    stringValue?: string;

    doubleValue?: number;

}
