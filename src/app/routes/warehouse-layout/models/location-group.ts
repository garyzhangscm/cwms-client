import { LocationGroupType } from './location-group-type';

export interface LocationGroup {
  id: number;
  name: string;
  description: string;
  locationGroupType: LocationGroupType;
}
