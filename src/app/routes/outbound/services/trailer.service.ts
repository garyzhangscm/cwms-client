import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Trailer } from '../models/trailer';

@Injectable({
  providedIn: 'root',
})
export class TrailerService {
  constructor(private http: _HttpClient) {}

  getTrailers(number: string): Observable<Trailer[]> { 

    const url = number ? `outbound/trailers?number=${number}` : `outbound/trailers`;
    return this.http.get(url).pipe(map(res => res.data));
  }
   

  getTrailer(id: number): Observable<Trailer> {
    return this.http.get(`outbound/trailers/${id}`).pipe(map(res => res.data));
  }

  addTrailer(trailer: Trailer): Observable<Trailer> {
    return this.http.post(`outbound/trailers`, stop).pipe(map(res => res.data));
  }

  changeTrailer(trailer: Trailer): Observable<Trailer> {
    const url = `outbound/trailers/${trailer.id}`;
    return this.http.put(url, trailer).pipe(map(res => res.data));
  }

  cancelTrailer(trailer: Trailer): Observable<Trailer> {
    const url = `outbound/trailers/${trailer.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  cancelTrailers(trailers: Trailer[]): Observable<Trailer[]> {
    const trailerIds: number[] = [];
    trailers.forEach(trailer => {
      trailerIds.push(trailer.id);
    });
    const params = {
      trailer_ids: trailerIds.join(','),
    };
    return this.http.delete('outbound/trailers', params).pipe(map(res => res.data));
  }
  checkinTrailer(trailer: Trailer, location?: WarehouseLocation): Observable<Trailer> {
    const url = `outbound/trailers/${trailer.id}/checkin`;
    return this.http.post(url, location).pipe(map(res => res.data));
  }
  dispatchTrailer(trailer: Trailer): Observable<Trailer> {
    const url = `outbound/trailers/${trailer.id}/dispatch`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
