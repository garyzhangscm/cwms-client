import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationReceiptLineConfirmation {
  id: number;

  number: string;

  warehouseId: number;
  warehouseName: string;

  itemId: number;
  itemName: string;

  expectedQuantity: number;
  receivedQuantity: number;

  overReceivingQuantity: number;
  overReceivingPercent: number;

  status: IntegrationStatus;
  insertTime: Date;
  lastUpdateTime: Date;
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
