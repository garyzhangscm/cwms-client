import { User } from '../../auth/models/user';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { Item } from '../../inventory/models/item';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WorkTask } from '../../work-task/models/work-task';
import { PickGroupType } from './pick-group-type.enum';
import { PickStatus } from './pick-status.enum';
import { PickType } from './pick-type.enum';

// a 
export interface PickWork {
  id: number;
  number: string;

  sourceLocationId?: number;
  sourceLocation?: WarehouseLocation;
  destinationLocationId?: number;
  destinationLocation?: WarehouseLocation;

  itemId?: number;
  item?: Item;

  quantity: number;
  pickedQuantity: number;

  
  displayQuantity?: number;
  displayUnitOfMeasureForQuantity?: UnitOfMeasure;
  displayPickedQuantity?: number;
  displayUnitOfMeasureForPickedQuantity?: UnitOfMeasure;

  pickType: PickType;

  pickListNumber?: string;
  bulkPickNumber?: string;
  cartonizationNumber?: string;
  orderNumber?: string;

  lpn?: string;
  workOrderLineId?: number; 
  workOrderNumber?: string;
  
  color?:string;
  productSize?:string;
  style?:string;

  status: PickStatus; 
  picks?: PickWork[];

  pickGroupType?: PickGroupType; 
  
  pickingByUserId?: number;
  pickingByUser?: User;
  assignedToUserId?: number;
  assignedToUser?: User;

  workTaskId?: number;
  workTask?: WorkTask;

  // for display purpose only
  showExpand?: boolean;

  
  inventoryAttribute1?:string;
  inventoryAttribute2?:string;
  inventoryAttribute3?:string;
  inventoryAttribute4?:string;
  inventoryAttribute5?:string;
}
