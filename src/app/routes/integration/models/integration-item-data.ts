import { IntegrationItemFamilyData } from './integration-item-family-data';
import { IntegrationItemPackageTypeData } from './integration-item-package-type-data';
import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationItemData {
  id: number;
  name: string;
  description: string;
  clientId: number;

  clientName: string;

  itemFamily: IntegrationItemFamilyData;
  itemPackageTypes: IntegrationItemPackageTypeData[];

  unitCost: number;
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
