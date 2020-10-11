import { PickWork } from './pick-work';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { PickListStatus } from './pick-list-status.enum';

export interface PickList {
  id: number;

  number: string;

  picks: PickWork[];

  groupKey: string;

  warehouseId: number;

  warehouse: Warehouse;

  status: PickListStatus;

  totalPickCount?: number;
  totalItemCount?: number;
  totalLocationCount?: number;
  totalQuantity?: number;
  totalPickedQuantity?: number;
}
