import { User } from '../../auth/models/user';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WorkTask } from '../../work-task/models/work-task';
import { PickStatus } from './pick-status.enum';
import { PickType } from './pick-type.enum';
import { PickWork } from './pick-work';

// a 
export interface BulkPick {
  
    id: number;

    number: string;
    waveNumber: string;
    
    warehouseId: number; 

    sourceLocationId: number;
    sourceLocation?: WarehouseLocation;

    itemId: number;
    item?: Item;
    picks: PickWork[];

    quantity: number;
    pickedQuantity: number;
    status: PickStatus;

    inventoryStatusId: number;
    inventoryStatus? : InventoryStatus;
    
    unitOfMeasureId: number;

    confirmItemFlag: boolean;
    confirmLocationFlag: boolean;
    confirmLocationCodeFlag: boolean;
    confirmLpnFlag: boolean;

    color?: string;
    productSize?: string;
    style?: string;

    pickingByUserId?: number;
    pickingByUser?: User;
    assignedToUserId?: number;
    assignedToUser?: User;

    workTaskId?: number; 
    workTask?: WorkTask;
}
