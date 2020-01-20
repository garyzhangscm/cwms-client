import { ShipmentLine } from './shipment-line';
import { ShipmentStatus } from './shipment-status.enum';
import { Carrier } from '../../common/models/carrier';
import { CarrierServiceLevel } from '../../common/models/carrier-service-level';

export interface Shipment {
  id: number;
  number: string;
  shipmentLines: ShipmentLine[];
  status: ShipmentStatus;
  carrierId: number;
  carrier: Carrier;
  carrierServiceLevelId: number;
  carrierServiceLevel: CarrierServiceLevel;
}
