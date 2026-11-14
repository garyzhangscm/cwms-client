import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Inventory } from './inventory';
import { Item } from './item';

export interface AuditCountResult {
  id?: number;
  batchId: string;
  location: WarehouseLocation;
  warehouseId: number;
  warehouse?: Warehouse;
  inventory: Inventory;
  lpn: string;
  item: Item;
  quantity: number;
  countQuantity: number;
}
