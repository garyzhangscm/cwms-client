import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationWorkOrderByProductConfirmation {
  id: number;
  

  itemId: number;
  itemName: string;

  expectedQuantity: number;
  producedQuantity: number;
  
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
