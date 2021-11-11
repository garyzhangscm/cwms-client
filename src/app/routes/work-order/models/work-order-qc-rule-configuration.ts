import { QCRule } from "../../qc/models/qc-rule";
import { ProductionLine } from "./production-line";
import { WorkOrder } from "./work-order";
import { WorkOrderQcRuleConfigurationRule } from "./work-order-qc-rule-configuration-rule";

export interface WorkOrderQcRuleConfiguration {
 
    id?: number;
    workOrderQCRuleConfigurationRules: WorkOrderQcRuleConfigurationRule[];
    warehouseId: number;
    productionLine?: ProductionLine;
    workOrder?: WorkOrder;
    qcQuantity?: number
}
