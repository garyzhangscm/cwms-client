import { Item } from './item';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { ItemFamily } from './item-family';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroup } from '../../warehouse-layout/models/location-group';

export interface EmergencyReplenishmentConfiguration {
  id: number;

  sequence: number;

  // Criteria: Item / Item Family / Source Location / Source Location Group
  // uom level
  unitOfMeasureId: number;
  unitOfMeasure: UnitOfMeasure;

  itemId: number;
  item: Item;

  warehouseId: number;
  warehouse: Warehouse;

  itemFamilyId: number;
  itemFamily: ItemFamily;

  sourceLocationId: number;
  sourceLocation: WarehouseLocation;

  sourceLocationGroupId: number;
  sourceLocationGroup: LocationGroup;

  // Destination / Destination Location Group
  // Anything that match the above criteria
  // will go to the destination location / location group
  destinationLocationId: number;
  destinationLocation: WarehouseLocation;

  destinationLocationGroupId: number;
  destinationLocationGroup: LocationGroup;
}
