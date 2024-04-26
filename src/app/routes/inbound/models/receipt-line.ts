import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { Item } from '../../inventory/models/item';
import { PurchaseOrderLine } from './purchase-order-line';
import { ReceiptLineBillableActivity } from './receipt-line-billable-activity';

export interface ReceiptLine {
  id?: number;
  number?: string;
  itemId?: number;
  item?: Item;
  receiptId?: number;
  receiptNumber?: string;
  expectedQuantity?: number;
  receivedQuantity?: number;
  displayExpectedQuantity?: number;
  displayUnitOfMeasureForExpectedQuantity?: UnitOfMeasure;
  displayReceivedQuantity?: number;
  displayUnitOfMeasureForReceivedQuantity?: UnitOfMeasure;

  overReceivingQuantity?: number;
  overReceivingPercent?: number;
  
  qcQuantity?: number;
  qcPercentage?: number;
  qcQuantityRequested?: number;

  purchaseOrderLine?: PurchaseOrderLine;
  receiptLineBillableActivities: ReceiptLineBillableActivity[];

  
  color?: string;
  productSize?: string;
  style?: string;
  
  inventoryAttribute1?: string;
  inventoryAttribute2?: string;
  inventoryAttribute3?: string;
  inventoryAttribute4?: string;
  inventoryAttribute5?: string;
}
