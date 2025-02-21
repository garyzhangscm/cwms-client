import { Warehouse } from "./warehouse";

export interface PickZone {
    id?: number;
    name?: string;
    description?: string;
    warehouse: Warehouse; 
    pickable?: boolean; 
    allowCartonization?: boolean; 
}
