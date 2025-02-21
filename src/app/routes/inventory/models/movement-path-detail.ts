import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { MovementPathStragety } from './movement-path-stragety.enum';

export interface MovementPathDetail {
  id: number;
  hopLocationId: number;
  hopLocation: WarehouseLocation;
  hopLocationGroupId: number;
  hopLocationGroup: LocationGroup;
  sequence: number;
  strategy: MovementPathStragety;
}
