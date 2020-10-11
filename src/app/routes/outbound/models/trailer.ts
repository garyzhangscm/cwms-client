import { Stop } from './stop';

import { TrailerType } from './trailer-type.enum';

import { Carrier } from '../../common/models/carrier';

import { CarrierServiceLevel } from '../../common/models/carrier-service-level';

import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';

import { TrailerStatus } from './trailer-status.enum';

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
