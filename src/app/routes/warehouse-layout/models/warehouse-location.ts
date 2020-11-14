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
  currentVolume: number;
  pendingVolume: number;
  locationGroup: LocationGroup;
  enabled: boolean;
  locked: boolean;
  reservedCode: string;
}
