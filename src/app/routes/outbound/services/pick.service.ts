import { Injectable } from '@angular/core';
import { PickWork } from '../models/pick-work';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PickService {
  constructor(private http: _HttpClient) {}

  getPicks(
    number?: string,
    orderNumber?: string,
    itemNumber?: string,
    sourceLocation?: string,
    destinationLocation?: string,
  ): Observable<PickWork[]> {
    let params = '';
    if (number) {
      params = `number=${number}`;
    }

    if (orderNumber) {
      params = `${params}&orderNumber=${orderNumber}`;
    }
    if (itemNumber) {
      params = `${params}&itemNumber=${itemNumber}`;
    }
    if (sourceLocation) {
      params = `${params}&sourceLocation=${sourceLocation}`;
    }
    if (destinationLocation) {
      params = `${params}&destinationLocation=${destinationLocation}`;
    }

    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = 'outbound/picks' + (params.length > 0 ? '?' + params : '');

    return this.http.get(url).pipe(map(res => res.data));
  }

  getPick(id: number): Observable<PickWork> {
    return this.http.get(`outbound/picks/${id}`).pipe(map(res => res.data));
  }

  addPick(pick: PickWork): Observable<PickWork> {
    return this.http.post(`outbound/picks`, pick).pipe(map(res => res.data));
  }

  changePick(pick: PickWork): Observable<PickWork> {
    const url = `outbound/picks/${pick.id}`;
    return this.http.put(url, pick).pipe(map(res => res.data));
  }

  cancelPicks(picks: PickWork[]): Observable<PickWork[]> {
    const pickIds: number[] = [];
    picks.forEach(pick => {
      pickIds.push(pick.id);
    });
    const params = {
      pick_ids: pickIds.join(','),
    };

    return this.http.delete('outbound/picks', params).pipe(map(res => res.data));
  }

  confirmPick(pick: PickWork): Observable<PickWork> {
    return this.http.post(`outbound/picks/${pick.id}/confirm`).pipe(map(res => res.data));
  }
}
