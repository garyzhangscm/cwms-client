import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Inventory } from './inventory';
import { Warehouse } from '../../warehouse-layout/models/warehouse';

export interface AuditCountResult {
  id: number;
  batchId: string;
  location: WarehouseLocation;
  warehouseId: number;
  warehouse?: Warehouse;
  inventory: Inventory;
  quantity: number;
  countQuantity: number;
}
