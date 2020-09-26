import { Client } from '../../common/models/client';
import { ItemFamily } from './item-family';
import { ItemUnitOfMeasure } from './item-unit-of-measure';
import { ItemPackageType } from './item-package-type';
import { AllocationRoundUpStrategyType } from './allocation-round-up-strategy-type.enum';

export interface Item {
  id: number;
  name: string;
  description: string;
  client: Client;
  itemFamily: ItemFamily;
  itemPackageTypes: ItemPackageType[];
  allowCartonization: boolean;
  unitCost: number;
  allowAllocationByLPN: boolean;
  allocationRoundUpStrategyType: AllocationRoundUpStrategyType;

  allocationRoundUpStrategyValue: number;

  trackingVolumeFlag: boolean;
  trackingLotNumberFlag: boolean;
  trackingManufactureDateFlag: boolean;
  shelfLifeDays: number;
  trackingExpirationDateFlag: boolean;

  warehouseId: number;
}
