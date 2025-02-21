import { Role } from "../../auth/models/role";
import { User } from "../../auth/models/user";
import { WorkingTeam } from "../../auth/models/working-team";
import { WorkingTeamService } from "../../auth/services/working-team.service";
import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location";
import { WorkTaskStatus } from "./work-task-status.enum";
import { WorkTaskType } from "./work-task-type.enum";

 
// a 
export interface WorkTask {
    
    id: number;
  

    number: string;
    
    type: WorkTaskType;
    status: WorkTaskStatus;

    priority: number;

    sourceLocationId: number;
    sourceLocation: WarehouseLocation;


    destinationLocationId: number;
    destinationLocation: WarehouseLocation;


    // bulk pick number if the task is bulk pick
    // list pick number if the task is list pick
    // pick number if the task is pick
    // LPN is the task is inventory related
    referenceNumber: string;

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


    startTime: Date;
    completeTime: Date;
}
