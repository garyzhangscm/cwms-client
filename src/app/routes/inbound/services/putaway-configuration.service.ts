import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { PutawayConfiguration } from '../models/putaway-configuration';
import { map } from 'rxjs/operators';
import { Inventory } from '../../inventory/models/inventory';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class PutawayConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getPutawayConfigurations(
    sequence?: number,
    itemName?: string,
    itemFamilyName?: string,
    inventoryStatus?: string,
  ): Observable<PutawayConfiguration[]> {
    let params = '';
    if (sequence != null) {
      params = `sequence=${sequence}`;
    }
    if (itemName != null) {
      params = `${params}&itemName=${itemName}`;
    }
    if (itemFamilyName != null) {
      params = `${params}&itemFamilyName=${itemFamilyName}`;
    }
    if (inventoryStatus != null) {
      params = `${params}&inventoryStatusId=${inventoryStatus}`;
    }
    params = `${params}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = 'inbound/putaway-configuration' + (params.length > 0 ? '?' + params : '');

    return this.http.get(url).pipe(map(res => res.data));
  }

  getPutawayConfiguration(id: number): Observable<PutawayConfiguration> {
    return this.http.get(`inbound/putaway-configuration/${id}`).pipe(map(res => res.data));
  }

  addPutawayConfiguration(putawayConfiguration: PutawayConfiguration): Observable<PutawayConfiguration> {
    return this.http.post(`inbound/putaway-configuration`, putawayConfiguration).pipe(map(res => res.data));
  }

  changePutawayConfiguration(putawayConfiguration: PutawayConfiguration): Observable<PutawayConfiguration> {
    const url = `inbound/putaway-configuration/${putawayConfiguration.id}`;
    return this.http.put(url, putawayConfiguration).pipe(map(res => res.data));
  }

  removePutawayConfiguration(putawayConfiguration: PutawayConfiguration): Observable<PutawayConfiguration> {
    const url = `inbound/putaway-configuration/${putawayConfiguration.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removePutawayConfigurations(putawayConfigurations: PutawayConfiguration[]): Observable<PutawayConfiguration[]> {
    const putawayConfigurationIds: number[] = [];
    putawayConfigurations.forEach(putawayConfiguration => {
      putawayConfigurationIds.push(putawayConfiguration.id);
    });
    const params = {
      putaway_configuration_ids: putawayConfigurationIds.join(','),
    };
    return this.http.delete('inbound/putaway-configuration', params).pipe(map(res => res.data));
  }

  allocateLocation(inventory: Inventory): Observable<Inventory> {
    return this.http.post(`inbound/putaway-configuration/allocate-location`, inventory).pipe(map(res => res.data));
  }
  reallocateLocation(inventory: Inventory): Observable<Inventory> {
    return this.http.post(`inbound/putaway-configuration/reallocate-location`, inventory).pipe(map(res => res.data));
  }
}
