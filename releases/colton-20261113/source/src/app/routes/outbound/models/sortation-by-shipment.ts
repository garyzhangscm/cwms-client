import { Shipment } from "./shipment";
import { SortationByShipmentLine } from "./sortation-by-shipment-line";

 

export interface SortationByShipment {
  id?: number;
  
  sortationByShipmentLines: SortationByShipmentLine[];
 

  shipment?: Shipment;
  shipmentId: number;
  orderNumbers: string;
  
  totalExpectedQuantity?: number;

  totalArrivedQuantity?: number;

  totalSortedQuantity?: number;
 
}