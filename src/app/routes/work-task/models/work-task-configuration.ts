import { LocationGroup } from "../../warehouse-layout/models/location-group";
import { LocationGroupType } from "../../warehouse-layout/models/location-group-type";
import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location";
import { OperationType } from "./operation-type";
import { WorkTaskType } from "./work-task-type.enum";
  
export interface WorkTaskConfiguration {
    
    id?: number;

    warehouseId: number;
 

    sourceLocationGroupTypeId?: number;
    sourceLocationGroupType?: LocationGroupType;
    sourceLocationGroupId?: number;
    sourceLocationGroup?: LocationGroup;
    sourceLocationId?: number;
    sourceLocation?: WarehouseLocation;
    destinationLocationGroupTypeId?: number;
    destinationLocationGroupType?: LocationGroupType;

    destinationLocationGroupId?: number;
    destinationLocationGroup?: LocationGroup;
    destinationLocationId?: number;
    destinationLocation?: WarehouseLocation;

    workTaskType?: WorkTaskType;
    operationType?: OperationType;
    operationTypeId?: number;

    priority?: number;
}
