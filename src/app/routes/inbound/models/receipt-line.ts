import { Item } from '../../inventory/models/item';
import { PurchaseOrderLine } from './purchase-order-line';

export interface ReceiptLine {
  id?: number;
  number?: string;
  itemId?: number;
  item?: Item;
  receiptId?: number;
  receiptNumber?: string;
  expectedQuantity?: number;
  receivedQuantity?: number;
  overReceivingQuantity?: number;
  overReceivingPercent?: number;
  
  qcQuantity?: number;
  qcPercentage?: number;
  qcQuantityRequested?: number;

  purchaseOrderLine?: PurchaseOrderLine;
}
