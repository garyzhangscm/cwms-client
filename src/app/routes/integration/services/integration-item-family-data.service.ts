import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationItemFamilyData } from '../models/integration-item-family-data';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemFamilyDataService {
  constructor(private http: _HttpClient) {}

  getItemFamilyData(integrationItemFamilyDataId?: number): Observable<IntegrationItemFamilyData[]> {
    let url = `integration/integration-data/item-families`;
    if (integrationItemFamilyDataId) {
      url = `${url}/${integrationItemFamilyDataId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  addItemFamilyData(itemFamilyData: IntegrationItemFamilyData) {
    const url = `integration/integration-data/item-families`;
    return this.http.put(url, itemFamilyData).pipe(map(res => res.data));
  }
}
