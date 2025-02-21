import { Stop } from "../../outbound/models/stop";
import { TrailerAppointmentStatus } from "./trailer-appointment-status.enum";
import { TrailerAppointmentType } from "./trailer-appointment-type.enum";

export interface TrailerAppointment {
    
    id?: number;
 
    companyId: number;
    warehouseId?: number;

    number: string;
    description: string;

    type?: TrailerAppointmentType;
    status: TrailerAppointmentStatus;
    stops?: Stop[]; 
    completedTime?:  Date;
}
