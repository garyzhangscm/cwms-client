import { WorkOrderProduceTransaction } from './work-order-produce-transaction';
import { WorkOrderLine } from './work-order-line';

export interface WorkOrderLineConsumeTransaction {
  id: number;

  workOrderProduceTransaction?: WorkOrderProduceTransaction;
  workOrderLine: WorkOrderLine;
  consumedQuantity: number;
}
