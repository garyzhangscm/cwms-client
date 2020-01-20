import { ShipmentLine } from './shipment-line';

export interface Wave {
  id: number;
  number: string;
  shipmentLines: ShipmentLine[];
  totalOrderCount: number;
  totalItemCount: number;
  totalQuantity: number;
  totalPickedQuantity: number;
  totalStagedQuantity: number;
  totalShippedQuantity: number;
}
