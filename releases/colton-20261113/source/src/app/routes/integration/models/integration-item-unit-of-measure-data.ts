import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationItemUnitOfMeasureData {
  id: number;

  itemId: number;
  itemName: string;

  itemPackageTypeId: number;
  itemPackageTypeName: string;
  unitOfMeasureId: number;
  unitOfMeasureName: string;

  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;

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
