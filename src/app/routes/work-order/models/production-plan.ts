import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { ProductionPlanLine } from './production-plan-line';

export interface ProductionPlan {
  id?: number;
  number?: string;
  description?: string;
  expectedQuantity?: number;
  inprocessQuantity?: number;
  producedQuantity?: number;
  warehouseId?: number;
  warehouse?: Warehouse;
  productionPlanLines: ProductionPlanLine[];
}
