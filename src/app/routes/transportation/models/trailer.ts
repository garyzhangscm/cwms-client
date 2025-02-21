import { TrailerAppointment } from "./trailer-appointment";

export interface Trailer {
    
    id?: number;
 
    companyId: number;
    warehouseId: number;
    
    currentAppointment?: TrailerAppointment;

    number: string;
    description: string;
    size: number;
}
