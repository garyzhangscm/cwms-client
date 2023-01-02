import { Order } from "./order";

 
export interface ParcelPackage {
  id: number;
  order: Order;

  warehouseId: number;

  trackingCode: string;
  trackingUrl: string;
  status: string;
  shipmentId: string;


  length: number;
  width: number;
  height: number;
  weight: number;

  carrier: string;
  service: string;

  deliveryDays: number;
  rate: number;

  labelResolution: number;
  labelSize: string;
  labelUrl: string;

  insurance: string;
  createdTime?: Date;
}
