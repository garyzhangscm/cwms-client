import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationCustomerData {
  id: number;
  name: string;
  description: string;
  contactorFirstname: string;
  contactorLastname: string;
  addressCountry: string;
  addressState: string;
  addressCounty: string;
  addressCity: string;
  addressDistrict: string;
  addressLine1: string;
  addressLine2: string;
  addressPostcode: string;

  status: IntegrationStatus;
  insertTime:  Date;
  lastUpdateTime:  Date;
  errorMessage: string;
}
