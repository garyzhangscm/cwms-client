import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';

import { Item } from './item';

import { CycleCountResult } from './cycle-count-result';

export interface AuditCountResult {
  id: number;
  batchId: string;
  location: WarehouseLocation;
  item: Item;
  cycleCountResult: CycleCountResult;
  countQuantity: number;
}
