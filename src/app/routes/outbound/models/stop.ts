import { Shipment } from './shipment';

export interface Stop {
  id: number;
  shipments: Shipment[];
}
