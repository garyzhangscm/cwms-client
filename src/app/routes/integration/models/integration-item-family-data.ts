import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationItemFamilyData {
  id: number;
  name: string;
  description: string;

  warehouseId: number;

  warehouseName: string;

  status: IntegrationStatus;
  insertTime:  Date;
  lastUpdateTime:  Date;
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
