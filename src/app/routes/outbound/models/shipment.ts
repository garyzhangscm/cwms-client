import { ShipmentLine } from './shipment-line';
import { ShipmentStatus } from './shipment-status.enum';
import { Carrier } from '../../common/models/carrier';
import { CarrierServiceLevel } from '../../common/models/carrier-service-level';
import { Customer } from '../../common/models/customer';
import { Client } from '../../common/models/client';

export interface Shipment {
  id: number;
  number: string;
  shipmentLines: ShipmentLine[];
  status: ShipmentStatus;
  carrierId: number;
  carrier: Carrier;
  carrierServiceLevelId: number;
  carrierServiceLevel: CarrierServiceLevel;

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
