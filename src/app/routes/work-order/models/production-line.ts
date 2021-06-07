import { WorkOrder } from './work-order';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { ProductionLineAssignment } from './production-line-assignment';

export interface ProductionLine {
  id?: number;
  name: string;

  warehouseId: number;
  warehouse?: Warehouse;

  inboundStageLocationId?: number;
  inboundStageLocation?: WarehouseLocation;
  outboundStageLocationId?: number;
  outboundStageLocation?: WarehouseLocation;
  productionLineLocationId?: number;
  productionLineLocation?: WarehouseLocation;

  productionLineAssignments: ProductionLineAssignment[];
  workOrderExclusiveFlag: boolean;
  enabled: boolean;
}
