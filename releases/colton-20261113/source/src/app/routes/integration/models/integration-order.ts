import { IntegrationOrderLine } from './integration-order-line';
import { IntegrationStatus } from './integration-status.enum';

export interface IntegrationOrder {
  id: number;
  number: string;

  shipToCustomerId: number;
  shipToCustomerName: string;

  warehouseId: number;
  warehouseName: string;

  billToCustomerId: number;
  billToCustomerName: string;

  shipToContactorFirstname: string;
  shipToContactorLastname: string;

  shipToAddressCountry: string;
  shipToAddressState: string;
  shipToAddressCounty: string;
  shipToAddressCity: string;
  shipToAddressDistrict: string;
  shipToAddressLine1: string;
  shipToAddressLine2: string;
  shipToAddressPostcode: string;

  billToContactorFirstname: string;
  billToContactorLastname: string;

  billToAddressCountry: string;
  billToAddressState: string;
  billToAddressCounty: string;
  billToAddressCity: string;
  billToAddressDistrict: string;
  billToAddressLine1: string;
  billToAddressLine2: string;
  billToAddressPostcode: string;

  carrierId: number;
  carrierName: string;

  carrierServiceLevelId: number;
  carrierServiceLevelName: string;

  clientId: number;
  clientName: string;

  orderLines: IntegrationOrderLine[];

  stageLocationGroupId: number;
  stageLocationGroupName: string;

  status: IntegrationStatus;
  insertTime:  Date;
  lastUpdateTime:  Date;
  errorMessage: string;
  
  createdTime:  Date;
  createdBy: string;
  lastModifiedTime:  Date;
  lastModifiedBy: string;
}
