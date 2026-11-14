import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { LocationGroup } from '../../warehouse-layout/models/location-group';

export interface GridConfiguration {
  id: number;
  warehouseId: number;
  warehouse: Warehouse;
  locationGroupId: number;
  locationGroup: LocationGroup;
  preAssignedLocation: boolean;
  allowConfirmByGroup: boolean;
  depositOnConfirm: boolean;
}
