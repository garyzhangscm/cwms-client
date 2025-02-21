import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationInventoryAdjustmentConfirmation {
  id: number;

  itemId: number;
  itemName: string;

  warehouseId: number;
  warehouseName: string;
  adjustQuantity: number;

  inventoryStatusId: number;
  inventoryStatusName: string;

  clientId: number;
  clientName: string;

  status: IntegrationStatus;
  insertTime: Date;
  lastUpdateTime: Date;
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
  
}
