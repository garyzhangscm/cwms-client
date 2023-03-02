import { Item } from '../../inventory/models/item';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { PickType } from './pick-type.enum';

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
  pickType: PickType;

  pickListNumber?: string;
  cartonizationNumber?: string;
  orderNumber?: string;

  lpn?: string;
  workOrderLineId?: number; 
  workOrderNumber?: string;
  
  color?:string;
  productSize?:string;
  style?:string;
}
