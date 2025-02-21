
import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location"; 
import { TractorAppointment } from "./tractor-appointment"; 
import { TractorStatus } from "./tractor-status.enum";
import { Trailer } from "./trailer";

export interface Tractor {
    
    id?: number;
 
    warehouseId: number;
    companyId: number;
 
    licensePlateNumber: string;

    number: string;
    description: string;
    currentAppointment?: TractorAppointment;
    locationId?: number;
    location?: WarehouseLocation;

    status: TractorStatus;
    
    attachedTrailers: Trailer[];
}
