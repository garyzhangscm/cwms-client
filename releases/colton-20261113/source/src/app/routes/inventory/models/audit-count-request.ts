import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from './item';
import { CycleCountResult } from './cycle-count-result';

export interface AuditCountRequest {
  id: number;
  batchId: string;
  location: WarehouseLocation;
}
