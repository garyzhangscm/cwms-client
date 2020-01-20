import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from '../../inventory/models/item';

export interface PickWork {
  id: number;
  number: number;

  sourceLocationId: number;
  sourceLocation: WarehouseLocation;
  destinationLocationId: number;
  destinationLocation: WarehouseLocation;

  itemId: number;
  item: Item;

  quantity: number;
  pickedQuantity: number;
}
