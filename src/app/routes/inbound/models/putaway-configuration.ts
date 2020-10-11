import { ItemFamily } from '../../inventory/models/item-family';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { Item } from '../../inventory/models/item';
import { InventoryStatus } from '../../inventory/models/inventory-status';

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
