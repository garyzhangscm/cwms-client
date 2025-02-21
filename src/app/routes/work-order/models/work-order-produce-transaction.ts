import { BillOfMaterial } from './bill-of-material';
import { ProductionLine } from './production-line';
import { WorkOrder } from './work-order';
import { WorkOrderByProductProduceTransaction } from './work-order-by-product-produce-transaction';
import { WorkOrderKpiTransaction } from './work-order-kpi-transaction';
import { WorkOrderLineConsumeTransaction } from './work-order-line-consume-transaction';
import { WorkOrderProducedInventory } from './work-order-produced-inventory';

export interface WorkOrderProduceTransaction {
  id?: number;
  workOrder?: WorkOrder;
  workOrderLineConsumeTransactions: WorkOrderLineConsumeTransaction[];
  workOrderProducedInventories: WorkOrderProducedInventory[];
  consumeByBomQuantity?: boolean;
  consumeByBom?: BillOfMaterial;
  workOrderByProductProduceTransactions: WorkOrderByProductProduceTransaction[];
  workOrderKPITransactions: WorkOrderKpiTransaction[];
  productionLine?: ProductionLine;

  printingNewLPNLabel?: boolean;
  labelPrinterName?: string;
  labelPrinterIndex?: number;

  workOrderNumber?: string;
  warehouseId?: number;
}
