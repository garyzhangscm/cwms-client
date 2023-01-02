import { CarrierServiceLevelType } from './carrier-service-level-type.enum';

export interface CarrierServiceLevel {
  id?: number;
  name: string;
  description?: string;
  type?: CarrierServiceLevelType;
}
