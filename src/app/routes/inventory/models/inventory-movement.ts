import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';

export interface InventoryMovement {
  id: number;
  locationId: number;
  location: WarehouseLocation;
  sequence: number;
}
