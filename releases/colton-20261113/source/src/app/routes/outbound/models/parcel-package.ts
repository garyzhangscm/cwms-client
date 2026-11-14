import { Order } from "./order";
import { ParcelPackageStatus } from "./parcel-package-status.enum";

 
export interface ParcelPackage {
  id?: number;
  order?: Order;

  warehouseId: number;

  trackingCode: string;
  trackingUrl: string;
  status: ParcelPackageStatus;
  statusDescription: string;
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
