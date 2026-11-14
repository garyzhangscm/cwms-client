import { Injectable } from '@angular/core';
import { GridDistributionWork } from '../models/grid-distribution-work';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GridDistributionWorkService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  get(locationGroupId: number, id: string): Observable<GridDistributionWork[]> {
    const url = `outbound/grid-distribution-work?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&locationGroupId=${locationGroupId}&id=${id}`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getByGridLocation(gridLocationConfigurationId: number): Observable<GridDistributionWork[]> {
    const url = `outbound/grid-distribution-work?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&gridLocationConfigurationId=${gridLocationConfigurationId}`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  confirmByItem(
    locationGroupId: number,
    gridLocationConfigurationId: number,
    id: string,
    itemName: string,
    quantity = 1,
  ): Observable<GridDistributionWork[]> {
    const url = `outbound/grid-distribution-work/confirm?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&gridLocationConfigurationId=${gridLocationConfigurationId}&locationGroupId=${locationGroupId}&id=${id}&itemName=${itemName}&quantity=${quantity}`;

    return this.http.post(url).pipe(map(res => res.data));
  }

  confirm(gridLocationConfigurationId: number, id: string): Observable<any> {
    const url = `outbound/grid-distribution-work/confirm?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&gridLocationConfigurationId=${gridLocationConfigurationId}&id=${id}`;

    return this.http.post(url).pipe(map(res => res.data));
  }
}
