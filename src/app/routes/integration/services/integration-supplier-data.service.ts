import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationSupplierData } from '../models/integration-supplier-data';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationSupplierDataService {
  constructor(private http: _HttpClient) {}

  getSupplierData(integrationSupplierDataId?: number): Observable<IntegrationSupplierData[]> {
    let url = `integration/integration-data/suppliers`;
    if (integrationSupplierDataId) {
      url = `${url}/${integrationSupplierDataId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  addSupplierData(supplierData: IntegrationSupplierData) {
    const url = `integration/integration-data/suppliers`;
    return this.http.put(url, supplierData).pipe(map(res => res.data));
  }
}
