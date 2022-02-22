import { TrailerAppointmentType } from "./trailer-appointment-type.enum";

export interface TrailerAppointment {
    
    id?: number;
 
    companyId: number;
    warehouseId?: number;


    type: TrailerAppointmentType;
}
