import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationReceiptConfirmation } from '../models/integration-receipt-confirmation';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationReceiptConfirmationService {
  constructor(private http: _HttpClient) {}

  getData(id?: number): Observable<IntegrationReceiptConfirmation[]> {
    let url = `integration/integration-data/receipt-confirmations`;
    if (id) {
      url = `${url}/${id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
