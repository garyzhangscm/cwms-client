 
import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { Supplier } from '../../common/models/supplier';
import { Carrier } from '../../transportation/models/carrier';
import { CarrierServiceLevel } from '../../transportation/models/carrier-service-level';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { HualeiShipmentRequest } from './hualei-shipment-request';
import { OrderBillableActivity } from './order-billable-activity';
import { OrderCategory } from './order-category';
import { OrderDocument } from './order-document';
import { OrderLine } from './order-line';
import { OrderStatus } from './order-status.enum';

export interface Order {
  id?: number;
  number: string;
  warehouseId?: number;

  status: OrderStatus;
  category: OrderCategory;

  transferReceiptNumber?: string;
  transferReceiptWarehouse?: Warehouse;
  transferReceiptWarehouseId?: number;

  supplierId?: number;
  supplier?: Supplier;

  orderDocuments?: OrderDocument[]; 
  carrierId?: number;
  carrier?: Carrier;
  carrierServiceLevelId?: number;
  carrierServiceLevel?: CarrierServiceLevel;

  shipToCustomerId?: number;
  shipToCustomer?: Customer;

  billToCustomerId?: number;
  billToCustomer?: Customer;

  allowForManualPick?: boolean;

  // Ship to Address
  shipToContactorFirstname?: string;
  shipToContactorLastname?: string;
  shipToContactorPhoneNumber?: string;

  shipToAddressCountry?: string;
  shipToAddressState?: string;
  shipToAddressCounty?: string;
  shipToAddressCity?: string;
  shipToAddressDistrict?: string;
  shipToAddressLine1?: string;
  shipToAddressLine2?: string;
  shipToAddressPostcode?: string;

  // Bill to Address
  billToContactorFirstname?: string;
  billToContactorLastname?: string;

  billToAddressCountry?: string;
  billToAddressState?: string;
  billToAddressCounty?: string;
  billToAddressCity?: string;
  billToAddressDistrict?: string;
  billToAddressLine1?: string;
  billToAddressLine2?: string;
  billToAddressPostcode?: string;

  clientId?: number;
  client?: Client;

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

  stageLocationGroupId?: number;
  stageLocationGroup?: LocationGroup;
  stageLocationId?: number;
  stageLocation?: WarehouseLocation;

  orderBillableActivities: OrderBillableActivity[];

  hualeiShipmentRequests?: HualeiShipmentRequest[];

  
  cancelRequested?: boolean;
  cancelRequestedTime?: Date;
  cancelRequestedUsername?: string;

  poNumber?: string;
  completeTime?:Date;
}
