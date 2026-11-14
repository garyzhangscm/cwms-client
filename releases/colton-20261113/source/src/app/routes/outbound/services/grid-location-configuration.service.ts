import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { GridLocationConfiguration } from '../models/grid-location-configuration';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GridLocationConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAll(locationGroupId?: number): Observable<GridLocationConfiguration[]> {
    let url = `outbound/grid-location-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (locationGroupId) {
      url = `${url}&locationGroupId=${locationGroupId}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  get(id: number): Observable<GridLocationConfiguration> {
    return this.http.get(`outbound/grid-location-configuration/${id}`).pipe(map(res => res.data));
  }

  add(gridLocationConfiguration: GridLocationConfiguration): Observable<GridLocationConfiguration> {
    return this.http
      .post(
        `outbound/grid-location-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`,
        gridLocationConfiguration,
      )
      .pipe(map(res => res.data));
  }

  change(gridLocationConfiguration: GridLocationConfiguration): Observable<GridLocationConfiguration> {
    const url = `outbound/grid-location-configuration/${gridLocationConfiguration.id}`;
    return this.http.put(url, gridLocationConfiguration).pipe(map(res => res.data));
  }
}
