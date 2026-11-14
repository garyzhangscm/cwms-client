import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CartonizationStatus } from './cartonization-status.enum';
import { Carton } from './carton';
import { PickWork } from './pick-work';

export interface Cartonization {
  id: number;
  number: string;
  groupKeyValue: string;

  warehouseId: number;
  warehouse: Warehouse;
  picks: PickWork[];

  status: CartonizationStatus;
  carton: Carton;

  totalSpace: number;
  usedSpace: number;

  totalPickCount?: number;
  totalItemCount?: number;
  totalLocationCount?: number;
  totalQuantity?: number;
  totalPickedQuantity?: number;
}
