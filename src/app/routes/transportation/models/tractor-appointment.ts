import { Carrier } from "../../common/models/carrier";
import { CarrierServiceLevel } from "../../common/models/carrier-service-level";
import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location"; 
import { TractorAppointmentType } from "./tractor-appointment-type.enum";
import { TractorCategory } from "./tractor-category.enum";
import { TractorStatus } from "./tractor-status.enum";
import { Trailer } from "./trailer";

export interface TractorAppointment {
    
    id: number;
 
    warehouseId: number; 
  

    driverFirstName: string;
    driverLastName: string;
    driverPhone: string;

    number: string;
    description: string; 
    
    type: TractorAppointmentType;

    trailers: Trailer[];
 

    carrier: Carrier;

    carrierServiceLevel: CarrierServiceLevel;  
}
