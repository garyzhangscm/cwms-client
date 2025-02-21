import { CarrierServiceLevel } from './carrier-service-level';

export interface Carrier {
  id?: number;
  name: string;
  warehouseId: number;
  description?: string;
  contactorFirstname?: string;
  contactorLastname?: string;
  addressCountry?: string;
  addressState?: string;
  addressCounty?: string;
  addressCity?: string;
  addressDistrict?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressPostcode?: string;
  trackingInfoUrl?: string;
  carrierServiceLevels: CarrierServiceLevel[];
  enabled?: boolean;
}
