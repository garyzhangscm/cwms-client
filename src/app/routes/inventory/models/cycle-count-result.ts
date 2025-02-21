import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { AuditCountRequest } from './audit-count-request';
import { Item } from './item';

export interface CycleCountResult {
  id?: number;
  batchId?: string;
  warehouseId?: number;
  warehouse?: Warehouse;
  location?: WarehouseLocation;
  item?: Item;
  quantity?: number;
  countQuantity?: number;
  auditCountRequest?: AuditCountRequest;
}
