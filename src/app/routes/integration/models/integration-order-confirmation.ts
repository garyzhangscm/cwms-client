import { IntegrationOrderLineConfirmation } from './integration-order-line-confirmation';
import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationOrderConfirmation {
  id: number;

  number: string;

  warehouseId: number;
  warehouseName: string;

  orderLines: IntegrationOrderLineConfirmation[];

  status: IntegrationStatus;
  insertTime: number[];
  lastUpdateTime: number[];
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
