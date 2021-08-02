import { OrderLine } from './order-line';
import { Shipment } from './shipment';
import { ShortAllocation } from './short-allocation';
import { PickWork } from './pick-work';

export interface ShipmentLine {
  id: number;
  number: string;
  orderNumber: string;
  orderLine: OrderLine;
  quantity: number;
  openQuantity: number;
  inprocessQuantity: number;
  stagedQuantity: number;
  loadedQuantity: number;
  shippedQuantity: number;
  shipment?: Shipment;

  picks: PickWork[];
  shortAllocation: ShortAllocation;
}
