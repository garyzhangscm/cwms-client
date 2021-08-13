import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationOrder } from '../models/integration-order';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationOrderService {
  constructor(private http: _HttpClient) {}

  getData(id?: number): Observable<IntegrationOrder[]> {
    let url = `integration/integration-data/orders`;
    if (id) {
      url = `${url}/${id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
