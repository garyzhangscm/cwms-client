import { Injectable } from '@angular/core';
import { ShortAllocation } from '../models/short-allocation';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ShortAllocationService {
  constructor(private http: _HttpClient) {}

  getShortAllocations(orderNumber?: string, itemNumber?: string): Observable<ShortAllocation[]> {
    let params = '';
    if (orderNumber) {
      params = `orderNumber=${orderNumber}`;
    }

    if (itemNumber) {
      params = `${params}&itemNumber=${itemNumber}`;
    }

    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = 'outbound/shortAllocations' + (params.length > 0 ? '?' + params : '');

    return this.http.get(url).pipe(map(res => res.data));
  }

  getShortAllocation(id: number): Observable<ShortAllocation> {
    return this.http.get(`outbound/shortAllocations/${id}`).pipe(map(res => res.data));
  }

  addShortAllocation(shortAllocation: ShortAllocation): Observable<ShortAllocation> {
    return this.http.post(`outbound/shortAllocations`, shortAllocation).pipe(map(res => res.data));
  }

  changeShortAllocation(shortAllocation: ShortAllocation): Observable<ShortAllocation> {
    const url = `outbound/shortAllocations/${shortAllocation.id}`;
    return this.http.put(url, shortAllocation).pipe(map(res => res.data));
  }

  cancelShortAllocations(shortAllocations: ShortAllocation[]): Observable<ShortAllocation[]> {
    const shortAllocationIds: number[] = [];
    shortAllocations.forEach(shortAllocation => {
      shortAllocationIds.push(shortAllocation.id);
    });
    const params = {
      shortAllocation_ids: shortAllocationIds.join(','),
    };

    return this.http.delete('outbound/shortAllocations', params).pipe(map(res => res.data));
  }
}
