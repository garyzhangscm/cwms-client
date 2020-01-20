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
  shippedQuantity: number;
  shipment?: Shipment;

  picks: PickWork[];
  shortAllocation: ShortAllocation;
}
