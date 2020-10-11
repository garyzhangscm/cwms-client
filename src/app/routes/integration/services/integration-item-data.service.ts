import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationItemData } from '../models/integration-item-data';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemDataService {
  constructor(private http: _HttpClient) {}

  getItemData(integrationItemDataId?: number): Observable<IntegrationItemData[]> {
    let url = `integration/integration-data/items`;
    if (integrationItemDataId) {
      url = `${url}/${integrationItemDataId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  addItemData(itemData: IntegrationItemData) {
    const url = `integration/integration-data/items`;
    return this.http.put(url, itemData).pipe(map(res => res.data));
  }
}
