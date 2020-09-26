import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';

export interface ItemUnitOfMeasure {
  client?: Client;
  supplier?: Supplier;
  unitOfMeasureId: number;
  unitOfMeasure: UnitOfMeasure;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  warehouseId: number;
}
