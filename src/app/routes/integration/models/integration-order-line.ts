import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationOrderLine {
  id: number;

  number: string;

  itemId: number;
  itemName: string;

  warehouseId: number;
  warehouseName: string;

  expectedQuantity: number;

  inventoryStatusId: number;
  inventoryStatusName: string;

  carrierId: number;
  carrierName: string;

  carrierServiceLevelId: number;
  carrierServiceLevelName: string;

  status: IntegrationStatus;
  insertTime: number[];
  lastUpdateTime: number[];
  errorMessage: string;
}
