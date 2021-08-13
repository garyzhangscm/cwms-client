import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IntegrationClientData } from '../models/integration-client-data';

@Injectable({
  providedIn: 'root',
})
export class IntegrationClientDataService {
  constructor(private http: _HttpClient) {}

  getClientData(integrationClientDataId?: number): Observable<IntegrationClientData[]> {
    let url = `integration/integration-data/clients`;
    if (integrationClientDataId) {
      url = `${url}/${integrationClientDataId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  addClientData(clientData: IntegrationClientData) {
    const url = `integration/integration-data/clients`;
    return this.http.put(url, clientData).pipe(map(res => res.data));
  }
}
