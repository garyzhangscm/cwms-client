import { IntegrationReceiptLineConfirmation } from './integration-receipt-line-confirmation';
import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationReceiptConfirmation {
  id: number;

  number: string;

  warehouseId: number;
  warehouseName: string;

  clientId: number;
  clientName: string;

  supplierId: number;
  supplierName: string;

  receiptLines: IntegrationReceiptLineConfirmation[];

  allowUnexpectedItem: boolean;

  status: IntegrationStatus;
  insertTime: number[];
  lastUpdateTime: number[];
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
