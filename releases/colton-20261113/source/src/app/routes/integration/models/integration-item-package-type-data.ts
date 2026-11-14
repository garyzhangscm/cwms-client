import { IntegrationItemUnitOfMeasureData } from './integration-item-unit-of-measure-data';
import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationItemPackageTypeData {
  id: number;

  itemId: number;
  itemName: string;

  name: string;
  description: string;

  clientId: number;

  clientName: string;

  supplierId: number;
  supplierName: string;

  itemUnitOfMeasures: IntegrationItemUnitOfMeasureData[];

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
