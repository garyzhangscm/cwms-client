export interface ProductionShiftSchedule {
    
    id?: number; 
    warehouseId: number; 
    shiftStartTime?: string; 
    shiftEndTime?: string; 
    shiftStartDateTime?: Date; 
    shiftEndDateTime?: Date; 
    shiftEndNextDay: boolean;
}
