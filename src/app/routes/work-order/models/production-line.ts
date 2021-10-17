import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { ProductionLineAssignment } from './production-line-assignment';
import { ProductionLineCapacity } from './production-line-capacity';
import { WorkOrder } from './work-order';

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
  genericPurpose: boolean;

  productionLineCapacities: ProductionLineCapacity[];
  
  model: string;
}
