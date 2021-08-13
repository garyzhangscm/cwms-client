import { Injectable } from '@angular/core';
import { IntegrationCustomerData } from '../models/integration-customer-data';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationCustomerDataService {
  constructor(private http: _HttpClient) {}

  getCustomerData(integrationCustomerDataId?: number): Observable<IntegrationCustomerData[]> {
    let url = `integration/integration-data/customers`;
    if (integrationCustomerDataId) {
      url = `${url}/${integrationCustomerDataId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  addCustomerData(customerData: IntegrationCustomerData) {
    const url = `integration/integration-data/customers`;
    return this.http.put(url, customerData).pipe(map(res => res.data));
  }
}
