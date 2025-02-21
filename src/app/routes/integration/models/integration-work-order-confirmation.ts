import { IntegrationStatus } from './integration-status.enum';
import { IntegrationWorkOrderByProductConfirmation } from './integration-work-order-by-product-confirmation';
import { IntegrationWorkOrderLineConfirmation } from './integration-work-order-line-confirmation';

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
  workOrderByProductConfirmations: IntegrationWorkOrderByProductConfirmation[];

  status: IntegrationStatus;
  insertTime: Date;
  lastUpdateTime: Date;
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
