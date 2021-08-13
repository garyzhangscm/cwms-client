import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationInventoryAdjustmentConfirmation } from '../models/integration-inventory-adjustment-confirmation';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationInventoryAdjustmentConfirmationService {
  constructor(private http: _HttpClient) {}

  getData(id?: number): Observable<IntegrationInventoryAdjustmentConfirmation[]> {
    let url = `integration/integration-data/inventory-adjustment-confirmations`;
    if (id) {
      url = `${url}/${id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
