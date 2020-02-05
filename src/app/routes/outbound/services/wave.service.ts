import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { Wave } from '../models/wave';
import { map } from 'rxjs/operators';
import { Order } from '../models/order';
import { OrderLine } from '../models/order-line';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class WaveService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWaves(number: string): Observable<Wave[]> {
    const url = number ? `outbound/waves?number=${number}` : `outbound/waves`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getWave(id: number): Observable<Wave> {
    return this.http.get(`outbound/waves/${id}`).pipe(map(res => res.data));
  }

  addWave(wave: Wave): Observable<Wave> {
    return this.http.post(`outbound/waves`, wave).pipe(map(res => res.data));
  }

  changeWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}`;
    return this.http.put(url, wave).pipe(map(res => res.data));
  }

  removeWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeWaves(waves: Wave[]): Observable<Wave[]> {
    const waveIds: number[] = [];
    waves.forEach(wave => {
      waveIds.push(wave.id);
    });
    const params = {
      wave_ids: waveIds.join(','),
    };
    return this.http.delete('outbound/waves', params).pipe(map(res => res.data));
  }

  findWaveCandidate(orderNumber?: string, customerName?: string): Observable<Order[]> {
    let params = '';
    if (orderNumber != null) {
      params = `orderNumber=${orderNumber}`;
    }
    if (customerName != null) {
      params = `&customerName=${customerName}`;
    }

    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = 'outbound/waves/candidate' + (params.length > 0 ? '?' + params : '');

    return this.http.get(url).pipe(map(res => res.data));
  }

  createWaveWithOrderLines(waveNumber: string, orderLines: OrderLine[]): Observable<Wave> {
    let url = `outbound/waves/plan?`;
    url = `${url}warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (waveNumber) {
      url = `${url}&waveNumber=${waveNumber}`;
    }
    return this.http.post(url, orderLines).pipe(map(res => res.data));
  }

  allocateWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}/allocate`;

    return this.http.post(url).pipe(map(res => res.data));
  }
}
