import { sequence } from '@angular/animations';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';  
import { ListPickConfiguration } from '../models/list-pick-configuration';
import { PickType } from '../models/pick-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ListPickConfigurationService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}
  
  getAll(pickType: PickType, customerId?: number, clientId?: number, 
    customerName?: string, clientName?: string): Observable<ListPickConfiguration[]> {
    let url = `outbound/list-pick-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    if (pickType) {
      url = `${url}&pickType=${pickType}`;
    }
    if (customerId != null) {
      url = `${url}&customerId=${customerId}`;
    }
    if (clientId != null) {
      url = `${url}&clientId=${clientId}`;
    }
    if (customerName) {
      url = `${url}&customerName=${customerName}`;
    }
    if (clientName) {
      url = `${url}&clientName=${clientName}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  get(id: number): Observable<ListPickConfiguration> {
    return this.http.get(`outbound/list-pick-configuration/${id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`).pipe(map(res => res.data));
  }

  add(listPickConfiguration: ListPickConfiguration): Observable<ListPickConfiguration> {
    return this.http
      .put(`outbound/list-pick-configuration`, listPickConfiguration)
      .pipe(map(res => res.data));
  }

  change(listPickConfiguration: ListPickConfiguration): Observable<ListPickConfiguration> {
    const url = `outbound/list-pick-configuration/${listPickConfiguration.id}`;
    return this.http.post(url, listPickConfiguration).pipe(map(res => res.data));
  }
  
  remove(listPickConfigurationId: number): Observable<string> {
    const url = `outbound/list-pick-configuration/${listPickConfigurationId}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
