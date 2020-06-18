import { IntegrationReceiptLine } from './integration-receipt-line';
import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationReceipt {
  id: number;

  number: string;

  warehouseId: number;
  warehouseName: string;

  clientId: number;
  clientName: string;

  supplierId: number;
  supplierName: string;

  receiptLines: IntegrationReceiptLine[];

  allowUnexpectedItem: boolean;

  status: IntegrationStatus;
  insertTime: number[];
  lastUpdateTime: number[];
  errorMessage: string;
}
