import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ABCCategory } from '../models/abc-category';
import { Velocity } from '../models/velocity';

@Injectable({
  providedIn: 'root'
})
export class VelocityService {

  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageService,
    private warehouseService: WarehouseService, 

  ) {}

  loadVelocities(refresh: boolean = true): Observable<Velocity[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('common.velocity');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`common/velocities?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.velocity', res)));
  }
  getVelocity(id: number): Observable<Velocity> {
    const data = this.gzLocalStorageService.getItem(`common.velocity.${id}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`common/velocities/${id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`common.velocity.${id}`, res)));
  }

  addVelocity(velocity: Velocity): Observable<Velocity> {
    return this.http.post('common/velocities', velocity).pipe(map(res => res.data));
  }

  changeVelocity(velocity: Velocity): Observable<Velocity> {
    const url = `common/velocities/${velocity.id}`;
    return this.http.put(url, velocity).pipe(map(res => res.data));
  }

  removeVelocity(velocity: Velocity): Observable<Velocity> {
    const url = `common/velocities/${velocity.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
