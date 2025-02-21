import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

import { MovementPath } from '../models/movement-path';

@Injectable({
  providedIn: 'root',
})
export class MovementPathService {
  constructor(
    private http: _HttpClient,

    
    private warehouseService: WarehouseService,
  ) {}

  getMovementPaths(
    fromLocationId?: number,
    fromLocationGroupId?: number,
    toLocationId?: number,
    toLocationGroupId?: number,
  ): Observable<MovementPath[]> {
    let params = '';
    if (fromLocationId) {
      params = `from_location_id=${fromLocationId}`;
    }
    if (fromLocationGroupId) {
      params = `${params}&from_location_group_id=${fromLocationGroupId}`;
    }
    if (toLocationId) {
      params = `${params}&to_location_id=${toLocationId}`;
    }
    if (toLocationGroupId) {
      params = `${params}&to_location_group_id=${toLocationGroupId}`;
    }
    params = `${params}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (params.startsWith('&')) {
      params = params.substring(1);
    }
    const url = 'inventory/movement-path' + (params.length > 0 ? '?' + params : '');
    return this.http.get(url).pipe(map(res => res.data));
  }

  getMovementPath(id: number): Observable<MovementPath> {
    return this.http.get(`inventory/movement-path/${id}`).pipe(map(res => res.data));
  }

  addMovementPath(movementPath: MovementPath): Observable<MovementPath> {
    return this.http.post('inventory/movement-path', movementPath).pipe(map(res => res.data));
  }
  changeMovementPath(movementPath: MovementPath): Observable<MovementPath> {
    return this.http.put(`inventory/movement-path/${movementPath.id}`, movementPath).pipe(map(res => res.data));
  }

  removeMovementPath(movementPath: MovementPath): Observable<MovementPath> {
    return this.http.delete(`inventory/movement-path/${movementPath.id}`).pipe(map(res => res.data));
  }

  removeMovementPaths(movementPaths: MovementPath[]): Observable<MovementPath[]> {
    const movementPathIds: number[] = [];
    movementPaths.forEach(movementPath => {
      movementPathIds.push(movementPath.id);
    });
    const params = {
      movement_path_ids: movementPathIds.join(','),
    };
    return this.http.delete(`inventory/movement-path`, params).pipe(map(res => res.data));
  }
}
