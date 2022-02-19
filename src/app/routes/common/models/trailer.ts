import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location";
import { Carrier } from "./carrier";
import { CarrierServiceLevel } from "./carrier-service-level";
import { TrailerCategory } from "./trailer-category.enum";
import { TrailerContainer } from "./trailer-container";
import { TrailerStatus } from "./trailer-status.enum";

export interface Trailer {
    
    id: number;
 
    warehouseId: number;


    driverFirstName: string;
    driverLastName: string;

    driverPhone: string;

    licensePlateNumber: string;

    number: string;
    description: string;
    
    size: number;
    category: TrailerCategory;

    carrier: Carrier;

    carrierServiceLevel: CarrierServiceLevel; 

    locationId: number;
    location: WarehouseLocation;
    status: TrailerStatus;
}
