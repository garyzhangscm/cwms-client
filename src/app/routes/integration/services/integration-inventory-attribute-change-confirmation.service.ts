import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationInventoryAttributeChangeConfirmation } from '../models/integration-inventory-attribute-change-confirmation';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationInventoryAttributeChangeConfirmationService {
  constructor(private http: _HttpClient) {}

  getData(id?: number): Observable<IntegrationInventoryAttributeChangeConfirmation[]> {
    let url = `integration/integration-data/inventory-attribute-change-confirmations`;
    if (id) {
      url = `${url}/${id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
