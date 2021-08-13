import { ProductionLine } from './production-line';
import { WorkOrder } from './work-order';
import { WorkOrderLine } from './work-order-line';
import { WorkOrderLineConsumeLPNTransaction } from './work-order-line-consume-lpn-transaction';
import { WorkOrderProduceTransaction } from './work-order-produce-transaction';

export interface WorkOrderLineConsumeTransaction {
  id?: number;

  workOrderProduceTransaction?: WorkOrderProduceTransaction;
  workOrderLine?: WorkOrderLine;
  consumedQuantity?: number;
  
  consumeFromWorkOrder?: WorkOrder;
  consumeFromWorkOrderQuantity?: number;
  consumeFromWorkOrderProductionLine?: ProductionLine;
  workOrderLineConsumeLPNTransactions?: WorkOrderLineConsumeLPNTransaction[];

  totalConsumedQuantity?: number;
}
