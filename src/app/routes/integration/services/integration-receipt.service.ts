import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationReceipt } from '../models/integration-receipt';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationReceiptService {
  constructor(private http: _HttpClient) {}

  getData(id?: number): Observable<IntegrationReceipt[]> {
    let url = `integration/integration-data/receipts`;
    if (id) {
      url = `${url}/${id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
