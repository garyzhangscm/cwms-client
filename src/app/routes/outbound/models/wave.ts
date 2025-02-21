import { ShipmentLine } from './shipment-line';
import { ShortAllocation } from './short-allocation';
import { WaveStatus } from './wave-status.enum';

export interface Wave {
  id?: number;
  number: string;
  status?: WaveStatus;
  shipmentLines: ShipmentLine[];
  totalOrderCount?: number;
  totalOrderLineCount?: number;
  totalItemCount?: number;
  totalQuantity?: number;
  totalOpenQuantity?: number;
  totalInprocessQuantity?: number;
  totalShortQuantity?: number;
  totalPickedQuantity?: number;
  totalStagedQuantity?: number;
  totalShippedQuantity?: number;
  
  shortAllocations?: ShortAllocation[];

  comment?: string;

  // load number and bill of loading numbers
  // from the shipments in the wave
  loadNumbers?: string; 
  billOfLadingNumbers?: string; 

}
