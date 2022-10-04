import { LocationGroup } from './location-group';

export interface WarehouseLocation {
  id?: number;
  name?: string;
  code?: string;
  aisle?: string;
  x?: number;
  y?: number;
  z?: number;
  length?: number;
  lengthUnit?: string;
  width?: number;
  widthUnit?: string;
  height?: number;
  heightUnit?: string;
  pickSequence?: number;
  putawaySequence?: number;
  countSequence?: number;
  capacity?: number;
  capacityUnit?: string;
  fillPercentage?: number;
  currentVolume?: number;
  pendingVolume?: number;
  locationGroup?: LocationGroup;
  enabled?: boolean;
  locked?: boolean;
  reservedCode?: string;
}
