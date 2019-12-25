import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { ReceiptLine } from './receipt-line';
import { ReceiptStatus } from './receipt-status.enum';

export interface Receipt {
  id: number;
  number: string;
  client: Client;
  clientId: number;
  supplier: Supplier;
  supplierId: number;
  receiptStatus: ReceiptStatus;
  receiptLines: ReceiptLine[];
  totalItemCount?: number;
  totalLineCount?: number;
  totalExpectedQuantity?: number;
  totalReceivedQuantity?: number;
}
