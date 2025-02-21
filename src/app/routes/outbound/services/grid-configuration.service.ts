import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { GridConfiguration } from '../models/grid-configuration';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GridConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAll(locationGroupId?: number): Observable<GridConfiguration[]> {
    let url = `outbound/grid-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (locationGroupId) {
      url = `${url}&locationGroupId=${locationGroupId}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  get(id: number): Observable<GridConfiguration> {
    return this.http.get(`outbound/grid-configuration/${id}`).pipe(map(res => res.data));
  }

  add(gridConfiguration: GridConfiguration): Observable<GridConfiguration> {
    return this.http
      .post(
        `outbound/grid-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`,
        gridConfiguration,
      )
      .pipe(map(res => res.data));
  }

  change(gridConfiguration: GridConfiguration): Observable<GridConfiguration> {
    const url = `outbound/grid-configuration/${gridConfiguration.id}`;
    return this.http.put(url, gridConfiguration).pipe(map(res => res.data));
  }
}
