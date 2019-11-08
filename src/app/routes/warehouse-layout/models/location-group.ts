import { LocationGroupType } from './location-group-type';

export interface LocationGroup {
  id: number;
  name: string;
  description: string;
  locationGroupType: LocationGroupType;
  locationCount: number;
  pickable: boolean;
  storable: boolean;
  countable: boolean;
}
