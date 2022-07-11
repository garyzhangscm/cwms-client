import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { AllocationConfigurationPickableUnitOfMeasure } from './allocation-configuration-pickable-unit-of-measure';
import { AllocationConfigurationType } from './allocation-configuration-type.enum'; 

export interface AllocationConfiguration {
  id?: number;
  sequence?: number;
  type?: AllocationConfigurationType;
  warehouseId: number;
  warehouse?: Warehouse;


  itemId?: number;
  item?: Item;


  itemFamilyId?: number;
  itemFamily?: ItemFamily;

  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;

  locationId?: number;
  location?: WarehouseLocation;

  locationGroupId?: number;
  locationGroup?: LocationGroup;

  locationGroupTypeId?: number;
  locationGroupType?: LocationGroupType;

  allocationConfigurationPickableUnitOfMeasures?: AllocationConfigurationPickableUnitOfMeasure[];


  allocationStrategy?: string;
}
