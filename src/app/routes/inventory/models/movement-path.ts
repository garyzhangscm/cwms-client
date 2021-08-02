import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { MovementPathDetail } from './movement-path-detail';

export interface MovementPath {
  id: number;
  fromLocationId: number;
  fromLocation: WarehouseLocation;
  fromLocationGroupId: number;
  fromLocationGroup: LocationGroup;

  toLocationId: number;
  toLocation: WarehouseLocation;
  toLocationGroupId: number;
  toLocationGroup: LocationGroup;

  sequence: number;
  movementPathDetails: MovementPathDetail[];
}
