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
  insertTime: number[];
  lastUpdateTime: number[];
  errorMessage: string;
}
