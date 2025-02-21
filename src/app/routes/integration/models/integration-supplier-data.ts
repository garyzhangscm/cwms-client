import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationSupplierData {
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
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
