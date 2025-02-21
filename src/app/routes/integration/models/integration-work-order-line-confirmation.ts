import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationWorkOrderLineConfirmation {
  id: number;
  number: string;

  itemId: number;
  itemName: string;

  expectedQuantity: number;
  openQuantity: number;
  inprocessQuantity: number;
  deliveredQuantity: number;
  consumedQuantity: number;
  scrappedQuantity: number;
  returnedQuantity: number;

  inventoryStatusId: number;
  inventoryStatusName: string;

  status: IntegrationStatus;
  insertTime: Date;
  lastUpdateTime: Date;
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
