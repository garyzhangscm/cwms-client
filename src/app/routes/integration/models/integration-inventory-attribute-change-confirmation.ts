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

  status: IntegrationStatus;
  insertTime: number[];
  lastUpdateTime: number[];
  errorMessage: string;
}