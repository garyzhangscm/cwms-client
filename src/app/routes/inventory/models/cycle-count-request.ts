import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';

export interface CycleCountRequest {
  id: number;
  batchId: string;
  location: WarehouseLocation;
}
