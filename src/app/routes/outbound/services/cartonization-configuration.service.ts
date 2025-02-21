import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CartonizationConfiguration } from '../models/cartonization-configuration';

@Injectable({
  providedIn: 'root',
})
export class CartonizationConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAll(
    clientIds?: string,
    pickType?: string,
    enabled?: boolean,
    sequence?: number,
  ): Observable<CartonizationConfiguration[]> {
    let url = `outbound/cartonization-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (clientIds) {
      url = `${url}&clientIds=${clientIds}`;
    }
    if (pickType) {
      url = `${url}&pickType=${pickType}`;
    }
    if (enabled) {
      url = `${url}&enabled=${enabled}`;
    }
    if (sequence) {
      url = `${url}&sequence=${sequence}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  get(id: number): Observable<CartonizationConfiguration> {
    return this.http.get(`outbound/cartonization-configuration/${id}`).pipe(map(res => res.data));
  }

  add(cartonizationConfiguration: CartonizationConfiguration): Observable<CartonizationConfiguration> {
    return this.http
      .post(`outbound/cartonization-configuration`, cartonizationConfiguration)
      .pipe(map(res => res.data));
  }

  change(cartonizationConfiguration: CartonizationConfiguration): Observable<CartonizationConfiguration> {
    const url = `outbound/cartonization-configuration/${cartonizationConfiguration.id}`;
    return this.http.put(url, cartonizationConfiguration).pipe(map(res => res.data));
  }
}
