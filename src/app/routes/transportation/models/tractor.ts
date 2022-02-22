import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location";
import { Carrier } from "./carrier";
import { CarrierServiceLevel } from "./carrier-service-level";
import { TractorCategory } from "./tractor-category.enum";
import { TractorStatus } from "./tractor-status.enum";
import { Trailer } from "./trailer";

export interface Tractor {
    
    id: number;
 
    warehouseId: number;


    driverFirstName: string;
    driverLastName: string;

    driverPhone: string;

    licensePlateNumber: string;

    number: string;
    description: string;
    
    size: number;
    category: TractorCategory;

    carrier: Carrier;

    carrierServiceLevel: CarrierServiceLevel; 

    locationId: number;
    location: WarehouseLocation;
    status: TractorStatus;

    attachedTrailer: Trailer[];
}
