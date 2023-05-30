import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WorkTask } from '../../work-task/models/work-task';
import { PickListStatus } from './pick-list-status.enum';
import { PickWork } from './pick-work';

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

  workTaskId?: number; 
  workTask?: WorkTask;
}
