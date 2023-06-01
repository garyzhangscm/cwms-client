
export interface PickConfiguration {
    id?: number;
    warehouseId: number; 
    releaseToWorkTask: boolean;
    workTaskPriority: number;

    releasePickListToWorkTask: boolean;
    pickListWorkTaskPriority: number;

}
