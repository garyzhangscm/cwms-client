import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationInventoryAttributeChangeConfirmation {
  id: number;

  itemId: number;
  itemName: string;

  warehouseId: number;
  warehouseName: string;

  quantity: number;

  inventoryStatusId: number;
  inventoryStatusName: string;

  clientId: number;
  clientName: string;

  attributeName: string;
  originalValue: string;
  newValue: string;

  status: IntegrationStatus;
  insertTime: Date;
  lastUpdateTime: Date
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
  
}
