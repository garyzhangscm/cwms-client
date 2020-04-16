import { Customer } from '../../common/models/customer';
import { Client } from '../../common/models/client';
import { OrderLine } from './order-line';
import { Carrier } from '../../common/models/carrier';
import { CarrierServiceLevel } from '../../common/models/carrier-service-level';

export interface Order {
  id: number;
  number: string;

  carrierId: number;
  carrier: Carrier;
  carrierServiceLevelId: number;
  carrierServiceLevel: CarrierServiceLevel;

  shipToCustomerId: number;
  shipToCustomer: Customer;

  billToCustomerId: number;
  billToCustomer: Customer;

  // Ship to Address
  shipTocontactorFirstname: string;
  shipTocontactorLastname: string;

  shipToAddressCountry: string;
  shipToAddressState: string;
  shipToAddressCounty: string;
  shipToAddressCity: string;
  shipToAddressDistrict: string;
  shipToAddressLine1: string;
  shipToAddressLine2: string;
  shipToAddressPostcode: string;

  // Bill to Address
  billTocontactorFirstname: string;
  billTocontactorLastname: string;

  billToAddressCountry: string;
  billToAddressState: string;
  billToAddressCounty: string;
  billToAddressCity: string;
  billToAddressDistrict: string;
  billToAddressLine1: string;
  billToAddressLine2: string;
  billToAddressPostcode: string;

  clientId: number;
  client: Client;

  orderLines: OrderLine[];

  totalLineCount?: number;
  totalItemCount?: number;
  totalExpectedQuantity?: number;
  totalOpenQuantity?: number; // Open quantity that is not in shipment yet
  totalInprocessQuantity?: number; // Total quantity that is in shipment
  // totalInprocessQuantity = totalPendingAllocationQuantity + totalOpenPickQuantity + totalPickedQuantity
  totalPendingAllocationQuantity?: number;
  totalOpenPickQuantity?: number;
  totalPickedQuantity?: number;
  totalShippedQuantity?: number;

  isReadyForShipping?: boolean;
  isReadyForStaging?: boolean;
  isReadyForLoading?: boolean;
  isReadyForDispatching?: boolean;
}
