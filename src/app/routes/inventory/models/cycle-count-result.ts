import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from './item';
import { AuditCountRequest } from './audit-count-request';
import { Warehouse } from '../../warehouse-layout/models/warehouse';

export interface CycleCountResult {
  id: number;
  batchId: string;
  warehouseId: number;
  warehouse?: Warehouse;
  location: WarehouseLocation;
  item: Item;
  quantity: number;
  countQuantity: number;
  auditCountRequest: AuditCountRequest;
}
