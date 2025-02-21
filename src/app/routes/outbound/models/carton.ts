import { Warehouse } from '../../warehouse-layout/models/warehouse';

export interface Carton {
  id: number;

  name: string;

  warehouseId: number;
  warehouse: Warehouse;

  length: number;
  width: number;
  height: number;
  fillRate: number;

  enabled: boolean;
  totalSpace: number;

  shippingCartonFlag: boolean;
  pickingCartonFlag: boolean;
}
