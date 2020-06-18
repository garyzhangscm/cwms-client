import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationOrderConfirmationService {
  constructor(private http: _HttpClient) {}

  getData(id?: number): Observable<IntegrationOrderConfirmation[]> {
    let url = `integration/integration-data/order-confirmations`;
    if (id) {
      url = `${url}/${id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
