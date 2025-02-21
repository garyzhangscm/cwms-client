import { SortDirection } from "../../util/models/sort-direction";

export interface BulkPickConfiguration {
    id?: number;
    warehouseId: number;
    enabledForOutbound: boolean;
    enabledForWorkOrder: boolean;
    pickSortDirection: SortDirection;
    
    releaseToWorkTask: boolean;
    workTaskPriority: number;

}
