
 
import { Tractor } from "./tractor";
import { TractorAppointmentType } from "./tractor-appointment-type.enum";
 

export interface TractorSchedule {
    
    id?: number;
 
    warehouseId: number;

    tractor: Tractor;
    
    checkInTime: Date;
    dispatchTime: Date;
    type: TractorAppointmentType;
    comment: string;
}
