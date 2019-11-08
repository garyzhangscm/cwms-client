import { LocationGroup } from './location-group';

export interface WarehouseLocation {
  id: number;
  name: string;
  aisle: string;
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
  pickSequence: number;
  putawaySequence: number;
  countSequence: number;
  capacity: number;
  fillPercentage: number;
  locationGroup: LocationGroup;
  enabled: boolean;
}
