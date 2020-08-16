import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationWorkOrderConfirmation } from '../models/integration-work-order-confirmation';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationWorkOrderConfirmationService {
  constructor(private http: _HttpClient) {}

  getData(id?: number): Observable<IntegrationWorkOrderConfirmation[]> {
    let url = `integration/integration-data/work-order-confirmations`;
    if (id) {
      url = `${url}/${id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
