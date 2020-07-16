import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { AllocationConfiguration } from '../models/allocation-configuration';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AllocationConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}
  getAllocationConfiguration(
    sequence?: number,
    itemId?: number,
    itemFamilyId?: number,
    allocationConfigurationType?: string,
    locationId?: number,
    locationGroupId?: number,
    locationGroupTypeId?: number,
    allocationStrategy?: string,
  ): Observable<AllocationConfiguration[]> {
    let url = `outbound/allocation-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (sequence) {
      url = `${url}&sequence=${sequence}`;
    }

    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (itemFamilyId) {
      url = `${url}&itemFamilyId=${itemFamilyId}`;
    }
    if (allocationConfigurationType) {
      url = `${url}&allocationConfigurationType=${allocationConfigurationType}`;
    }
    if (locationId) {
      url = `${url}&locationId=${locationId}`;
    }
    if (locationGroupId) {
      url = `${url}&locationGroupId=${locationGroupId}`;
    }
    if (locationGroupTypeId) {
      url = `${url}&locationGroupTypeId=${locationGroupTypeId}`;
    }
    if (allocationStrategy) {
      url = `${url}&allocationStrategy=${allocationStrategy}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
}
