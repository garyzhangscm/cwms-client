import { Item } from '../../inventory/models/item';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { ItemFamily } from '../../inventory/models/item-family';
import { AllocationConfigurationType } from './allocation-configuration-type.enum';
import { type } from 'os';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { AllocationStrategy } from './allocation-strategy.enum';
import { PickableUnitOfMeasure } from './pickable-unit-of-measure';

export interface AllocationConfiguration {
  id: number;
  sequence: number;

  itemId: number;
  item: Item;

  warehouseId: number;
  warehouse: Warehouse;

  itemFamilyId: number;
  itemFamily: ItemFamily;

  type: AllocationConfigurationType;

  locationId: number;
  location: WarehouseLocation;

  locationGroupId: number;
  locationGroup: LocationGroup;

  locationGroupTypeId: number;
  locationGroupType: LocationGroupType;

  allocationStrategy: AllocationStrategy;

  pickableUnitOfMeasures: PickableUnitOfMeasure[];
}
