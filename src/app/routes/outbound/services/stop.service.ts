import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Stop } from '../models/stop';

@Injectable({
  providedIn: 'root',
})
export class StopService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getStops(): Observable<Stop[]> {
    const url = `outbound/stops`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getStop(id: number): Observable<Stop> {
    return this.http.get(`outbound/stops/${id}`).pipe(map(res => res.data));
  }

  addStop(stop: Stop): Observable<Stop> {
    return this.http.post(`outbound/stops`, stop).pipe(map(res => res.data));
  }

  changeStop(stop: Stop): Observable<Stop> {
    const url = `outbound/stops/${stop.id}`;
    return this.http.put(url, stop).pipe(map(res => res.data));
  }

  removeStop(stop: Stop): Observable<Stop> {
    const url = `outbound/stops/${stop.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeStops(stops: Stop[]): Observable<Stop[]> {
    const stopIds: number[] = [];
    stops.forEach(stop => {
      stopIds.push(stop.id);
    });
    const params = {
      stop_ids: stopIds.join(','),
    };
    return this.http.delete('outbound/stops', params).pipe(map(res => res.data));
  }
  
  getOpenStops(): Observable<Stop[]> {
    const url = `outbound/stops/open?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
}
