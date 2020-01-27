import { ShipmentLine } from './shipment-line';
import { WaveStatus } from './wave-status.enum';

export interface Wave {
  id: number;
  number: string;
  status: WaveStatus;
  shipmentLines: ShipmentLine[];
  totalOrderCount: number;
  totalItemCount: number;
  totalQuantity: number;
  totalPickedQuantity: number;
  totalStagedQuantity: number;
  totalShippedQuantity: number;
}
