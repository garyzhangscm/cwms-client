import { QCRuleItem } from "./qc-rule-item";

export interface QCRule {
    
    id?: number;

    warehouseId: number;

    name: string;
    description: string;
    qcRuleItems: QCRuleItem[];
}