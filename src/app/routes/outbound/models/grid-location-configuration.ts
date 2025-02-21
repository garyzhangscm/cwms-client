import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';

export interface GridLocationConfiguration {
  id: number;
  warehouseId: number;
  warehouse: Warehouse;
  locationGroupId: number;
  locationGroup: LocationGroup;

  locationId: number;

  location: WarehouseLocation;
  rowNumber: number;
  columnSpan: number;

  pendingQuantity: number;
  arrivedQuantity: number;

  permanentLPNFlag: boolean;
  permanentLPN: string;
  currentLPN: string;
}
