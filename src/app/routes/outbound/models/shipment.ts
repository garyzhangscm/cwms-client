import { Carrier } from '../../common/models/carrier';
import { CarrierServiceLevel } from '../../common/models/carrier-service-level';
import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { ShipmentLine } from './shipment-line';
import { ShipmentStatus } from './shipment-status.enum';

export interface Shipment {
  id: number;
  number: string;
  shipmentLines: ShipmentLine[];
  orderNumbers: string[];
  status: ShipmentStatus;
  carrierId: number;
  carrier: Carrier;
  carrierServiceLevelId: number;
  carrierServiceLevel: CarrierServiceLevel;
  stopNumber: string;

  clientId: number;
  client: Client;

  shipToCustomerId: number;
  shipToCustomer: Customer;

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

  totalLineCount?: number;
  totalItemCount?: number;
  totalQuantity?: number;
  totalOpenQuantity?: number;
  totalInprocessQuantity?: number;
  totalLoadedQuantity?: number;
  totalShippedQuantity?: number;
}
