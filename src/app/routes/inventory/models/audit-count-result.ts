import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Inventory } from './inventory';

export interface AuditCountResult {
  id: number;
  batchId: string;
  location: WarehouseLocation;
  inventory: Inventory;
  quantity: number;
  countQuantity: number;
}
