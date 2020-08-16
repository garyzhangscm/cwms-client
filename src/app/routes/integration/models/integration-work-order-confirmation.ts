import { IntegrationWorkOrderLineConfirmation } from './integration-work-order-line-confirmation';
import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationWorkOrderConfirmation {
  id: number;
  number: string;
  productionLineName: string;
  itemId: number;
  itemName: string;

  warehouseId: number;
  warehouseName: string;

  billOfMaterialName: string;
  expectedQuantity: number;
  producedQuantity: number;
  workOrderLineConfirmations: IntegrationWorkOrderLineConfirmation[];

  status: IntegrationStatus;
  insertTime: number[];
  lastUpdateTime: number[];
  errorMessage: string;
}
