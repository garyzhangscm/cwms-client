import { WarehouseConfig } from './warehouse-config';

export interface Warehouse {
  id: number;
  name: string;
  size: string;
  companyId: number;

  addressLine1: string;
  addressLine2?: string;
  addressCountry: string;
  addressState: string;
  addressCounty?: string;
  addressCity: string;
  addressDistrict?: string;
  addressPostcode: string;
  config?: WarehouseConfig;
}
