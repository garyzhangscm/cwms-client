import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { PutawayConfigurationStrategy } from './putaway-configuration-strategy';

export interface PutawayConfiguration {
  id?: number;
  warehouseId: number;
  
  sequence?: number;
  item?: Item;
  itemId?: number;
  itemFamily?: ItemFamily;
  itemFamilyId?: number;
  inventoryStatus?: InventoryStatus;
  inventoryStatusId?: number;
  location?: WarehouseLocation;
  locationId?:number;
  locationGroup?: LocationGroup;
  locationGroupId?: number;
  locationGroupType?: LocationGroupType;
  locationGroupTypeId?: number;
  strategies: string;
  putawayConfigurationStrategies: PutawayConfigurationStrategy[];
}
