import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';

export interface PutawayConfiguration {
  id: number;
  sequence: number;
  item: Item;
  itemFamily: ItemFamily;
  inventoryStatus: InventoryStatus;
  location: WarehouseLocation;
  locationGroup: LocationGroup;
  locationGroupType: LocationGroupType;
}
