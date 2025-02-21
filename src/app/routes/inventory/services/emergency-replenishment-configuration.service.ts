import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { EmergencyReplenishmentConfiguration } from '../models/emergency-replenishment-configuration';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EmergencyReplenishmentConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}
  getEmergencyReplenishmentConfiguration(
    sequence?: number,
    unitOfMeasureId?: number,
    itemId?: number,
    itemFamilyId?: number,
    sourceLocationId?: number,
    sourceLocationGroupId?: number,
    destinationLocationId?: number,
    destinationLocationGroupId?: number,
  ): Observable<EmergencyReplenishmentConfiguration[]> {
    let url = `outbound/emergency-replenishment-configuration?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }`;

    if (sequence) {
      url = `${url}&sequence=${sequence}`;
    }
    if (unitOfMeasureId) {
      url = `${url}&unitOfMeasureId=${unitOfMeasureId}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (itemFamilyId) {
      url = `${url}&itemFamilyId=${itemFamilyId}`;
    }
    if (sourceLocationId) {
      url = `${url}&sourceLocationId=${sourceLocationId}`;
    }
    if (sourceLocationGroupId) {
      url = `${url}&sourceLocationGroupId=${sourceLocationGroupId}`;
    }
    if (destinationLocationId) {
      url = `${url}&destinationLocationId=${destinationLocationId}`;
    }
    if (destinationLocationGroupId) {
      url = `${url}&destinationLocationGroupId=${destinationLocationGroupId}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
}
