import { OrderLine } from './order-line';
import { PickWork } from './pick-work';
import { Shipment } from './shipment';
import { ShortAllocation } from './short-allocation';

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

  shipmentNumber?: string;
  shipmentLoadNumber?: string;
  shipmentBillOfLadingNumber?: string;

  picks: PickWork[];
  shortAllocation: ShortAllocation;
}
