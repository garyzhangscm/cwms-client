import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { PurchaseOrder } from './purchase-order';
import { ReceiptBillableActivity } from './receipt-billable-activity';
import { ReceiptLine } from './receipt-line';
import { ReceiptStatus } from './receipt-status.enum';
import { ReceivingTransaction } from './receiving-transaction';

export interface Receipt {
  id?: number;
  number: string;
  client?: Client;
  clientId?: number;
  supplier?: Supplier;
  warehouseId: number;
  supplierId?: number;
  receiptStatus: ReceiptStatus;
  allowUnexpectedItem: boolean;
  receiptLines: ReceiptLine[];
  totalItemCount?: number;
  totalLineCount?: number;
  totalExpectedQuantity?: number;
  totalReceivedQuantity?: number;
  purchaseOrder?: PurchaseOrder;
  receiptBillableActivities: ReceiptBillableActivity[];
  receiptLineBillableActivities: ReceiptBillableActivity[];

  receivingTransactions?: ReceivingTransaction[];
  checkInTime?: Date;
}
