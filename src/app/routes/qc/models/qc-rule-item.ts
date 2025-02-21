import { QCRuleItemComparator } from "./qc-rule-item-comparator";
import { QCRuleItemType } from "./qc-rule-item-type";

export interface QCRuleItem {
    
    id?: number;

    checkPoint: string;

    enabled: boolean;


    qcRuleItemType: QCRuleItemType;

    expectedValue: string;

    qcRuleItemComparator: QCRuleItemComparator;
}
