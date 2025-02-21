import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationConfiguration } from '../models/allocation-configuration';


@Injectable({
  providedIn: 'root',
})
export class AllocationConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}
  getAllocationConfigurations(
    sequence?: number,
    itemId?: number,
    itemFamilyId?: number,
    allocationConfigurationType?: string,
    locationId?: number,
    locationGroupId?: number,
    locationGroupTypeId?: number,
    allocationStrategy?: string,
    itemName?: string,
  ): Observable<AllocationConfiguration[]> {
    let url = `outbound/allocation-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (sequence) {
      url = `${url}&sequence=${sequence}`;
    }

    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
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
  
  getAllocationConfiguration(id: number): Observable<AllocationConfiguration> {
    let url = `outbound/allocation-configuration/${id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.get(url).pipe(map(res => res.data));
  }
  addAllocationConfiguration(allocationConfiguration: AllocationConfiguration): Observable<AllocationConfiguration> {
    let url = `outbound/allocation-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.put(url, allocationConfiguration).pipe(map(res => res.data));
  }
  changeAllocationConfiguration(allocationConfiguration: AllocationConfiguration): Observable<AllocationConfiguration> {
    let url = `outbound/allocation-configuration/${allocationConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.post(url, allocationConfiguration).pipe(map(res => res.data));
  }
  removeAllocationConfiguration(allocationConfiguration: AllocationConfiguration): Observable<AllocationConfiguration> {
    let url = `outbound/allocation-configuration/${allocationConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.delete(url).pipe(map(res => res.data));
  }
}
