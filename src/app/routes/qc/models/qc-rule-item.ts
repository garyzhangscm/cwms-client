import { QCRuleItemComparator } from "./qc-rule-item-comparator";
import { QCRuleItemType } from "./qc-rule-item-type";

export interface QCRuleItem {
    
    id?: number;

    checkPoint: string;


    qcRuleItemType: QCRuleItemType;

    expectedValue: string;

    qcRuleItemComparator: QCRuleItemComparator;
}
