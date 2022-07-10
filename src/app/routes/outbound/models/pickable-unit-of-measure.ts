import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { Warehouse } from '../../warehouse-layout/models/warehouse';

export interface PickableUnitOfMeasure {
  id?: number;

  unitOfMeasureId: number;
  unitOfMeasure: UnitOfMeasure;
  warehouseId: number;
  warehouse: Warehouse;
}
