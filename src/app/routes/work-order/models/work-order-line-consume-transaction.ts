import { WorkOrderLine } from './work-order-line';
import { WorkOrderProduceTransaction } from './work-order-produce-transaction';

export interface WorkOrderLineConsumeTransaction {
  id?: number;

  workOrderProduceTransaction?: WorkOrderProduceTransaction;
  workOrderLine?: WorkOrderLine;
  consumedQuantity?: number;
}
