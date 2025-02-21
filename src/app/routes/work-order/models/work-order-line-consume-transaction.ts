import { ProductionLine } from './production-line';
import { WorkOrder } from './work-order';
import { WorkOrderLine } from './work-order-line';
import { WorkOrderLineConsumeLPNTransaction } from './work-order-line-consume-lpn-transaction';
import { WorkOrderProduceTransaction } from './work-order-produce-transaction';

export interface WorkOrderLineConsumeTransaction {
  id?: number;

  workOrderProduceTransaction?: WorkOrderProduceTransaction;
  workOrderLine?: WorkOrderLine;
  consumingByBomQuantity?: number;  // if we consume by bom
  consumedQuantity?: number;        // use manually type in the consume quantity
  consumingByLPNQuantity?: number;   // consume from non picked inventory
  consumingByWorkOrderQuantity?: number;    // consume from other work order's finish goods
  
  consumeFromWorkOrder?: WorkOrder;
  consumeFromWorkOrderQuantity?: number;
  consumeFromWorkOrderProductionLine?: ProductionLine;
  workOrderLineConsumeLPNTransactions?: WorkOrderLineConsumeLPNTransaction[];

  totalConsumedQuantity?: number;
}
