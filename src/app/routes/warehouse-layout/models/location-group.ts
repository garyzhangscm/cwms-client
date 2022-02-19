import { InventoryConsolidationStrategy } from './inventory-consolidation-strategy.enum';
import { LocationGroupType } from './location-group-type';
import { LocationVolumeTrackingPolicy } from './location-volume-tracking-policy.enum';
import { Warehouse } from './warehouse';

export interface LocationGroup {
  id: number;
  name: string;
  description: string;
  warehouse: Warehouse;
  locationGroupType: LocationGroupType;
  locationCount: number;
  pickable: boolean;
  storable: boolean;
  countable: boolean;
  adjustable: boolean;
  trackingVolume: boolean;
  allowEmptyLocation: boolean;
  volumeTrackingPolicy: LocationVolumeTrackingPolicy;
  inventoryConsolidationStrategy: InventoryConsolidationStrategy;
}
