import { Carrier } from '../../transportation/models/carrier';
import { CarrierServiceLevel } from '../../transportation/models/carrier-service-level';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Stop } from './stop';
import { TrailerStatus } from './trailer-status.enum';
import { TrailerType } from './trailer-type.enum';

export interface Trailer {
  id: number;
  stops: Stop[];
  driverFirstName: string;
  driverLastName: string;
  driverPhone: string;
  licensePlateNumber: string;
  number: string;
  size: string;
  type: TrailerType;
  carrierId: number;
  carrier: Carrier;
  carrierServiceLevelId: number;
  carrierServiceLevel: CarrierServiceLevel;
  locationId: number;
  location: WarehouseLocation;
  status: TrailerStatus;
}
