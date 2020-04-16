import { ShipmentLine } from './shipment-line';
import { WaveStatus } from './wave-status.enum';

export interface Wave {
  id: number;
  number: string;
  status: WaveStatus;
  shipmentLines: ShipmentLine[];
  totalOrderCount?: number;
  totalOrderLineCount?: number;
  totalItemCount?: number;
  totalQuantity?: number;
  totalOpenQuantity?: number;
  totalInprocessQuantity?: number;
  totalPickedQuantity?: number;
  totalStagedQuantity?: number;
  totalShippedQuantity?: number;
}
