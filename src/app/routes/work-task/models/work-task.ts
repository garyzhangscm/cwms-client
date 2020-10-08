import { Role } from '../../auth/models/role';
import { User } from '../../auth/models/user';
import { WorkingTeam } from '../../auth/models/working-team';
import { Inventory } from '../../inventory/models/inventory';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WorkStatus } from './work-status.enum';
import { WorkType } from './work-type.enum';

export interface WorkTask {
  id: number;

  warehouseId: number;
  warehouse: Warehouse;

  number: string;
  workType: WorkType;

  workStatus: WorkStatus;

  sourceLocationId: number;
  sourceLocation: WarehouseLocation;

  destinationLocationId: number;
  destinationLocation: WarehouseLocation;

  inventoryId: number;
  inventory: Inventory;

  assignedUserId: number;
  assignedUser: User;

  assignedRoleId: number;
  assignedRole: Role;

  assignedWorkingTeamId: number;
  assignedWorkingTeam: WorkingTeam;

  currentUserId: number;
  currentUser: User;

  completeUserId: number;
  completeUser: User;

  startTime: number[];
  completeTime: number[];
}
