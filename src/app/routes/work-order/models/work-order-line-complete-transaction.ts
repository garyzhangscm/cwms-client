import { ReturnMaterialRequest } from './return-material-request';
import { WorkOrderLine } from './work-order-line';

export interface WorkOrderLineCompleteTransaction {
  id?: number;
  returnMaterialRequests: ReturnMaterialRequest[];
  workOrderLine?: WorkOrderLine;
  adjustedConsumedQuantity?: number;
  scrappedQuantity?: number;
}
