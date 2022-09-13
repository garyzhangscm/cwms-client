import { Client } from '../../common/models/client';
import { AllocationRoundUpStrategyType } from './allocation-round-up-strategy-type.enum';
import { ItemFamily } from './item-family';
import { ItemPackageType } from './item-package-type';
import { ItemUnitOfMeasure } from './item-unit-of-measure';

export interface Item {
  id?: number;
  name: string;
  description: string;
  clientId?: number;
  client?: Client;
  itemFamily?: ItemFamily;
  itemPackageTypes: ItemPackageType[];
  defaultItemPackageType? : ItemPackageType
  allowCartonization?: boolean;
  unitCost?: number;
  allowAllocationByLPN?: boolean;
  allocationRoundUpStrategyType?: AllocationRoundUpStrategyType;

  allocationRoundUpStrategyValue?: number;

  trackingVolumeFlag?: boolean;
  trackingLotNumberFlag?: boolean;
  trackingManufactureDateFlag?: boolean;
  shelfLifeDays?: number;
  trackingExpirationDateFlag?: boolean;

  warehouseId?: number;
  companyId: number;

  imageUrl?: string;
  thumbnailUrl?: string;


}
