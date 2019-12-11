import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from './item';
import { AuditCountRequest } from './audit-count-request';

export interface CycleCountResult {
  id: number;
  batchId: string;
  location: WarehouseLocation;
  item: Item;
  quantity: number;
  countQuantity: number;
  auditCountRequest: AuditCountRequest;
}
