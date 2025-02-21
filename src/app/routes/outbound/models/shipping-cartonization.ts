import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { Carton } from './carton';

export interface ShippingCartonization {
  id: number;
  number: string;
  warehouseId: number;
  warehouse: Warehouse;
  carton: Carton;
}
