import { Shipment } from "./shipment";
import { SortationByShipment } from "./sortation-by-shipment";
import { SortationByShipmentLine } from "./sortation-by-shipment-line";
import { Wave } from "./wave";

 

export interface Sortation {
  id?: number;
  
  warehouseId: number;

  number: string;

  wave: Wave;
 
  locationId: number;
  sortationByShipments: SortationByShipment[];
 
}