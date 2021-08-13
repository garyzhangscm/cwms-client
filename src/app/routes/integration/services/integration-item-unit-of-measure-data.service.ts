import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationItemUnitOfMeasureData } from '../models/integration-item-unit-of-measure-data';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemUnitOfMeasureDataService {
  constructor(private http: _HttpClient) {}

  getItemUnitOfMeasureData(
    integrationItemUnitOfMeasureDataId?: number,
  ): Observable<IntegrationItemUnitOfMeasureData[]> {
    let url = `integration/integration-data/item-unit-of-measures`;
    if (integrationItemUnitOfMeasureDataId) {
      url = `${url}/${integrationItemUnitOfMeasureDataId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  addItemUnitOfMeasureData(itemUnitOfMeasureData: IntegrationItemUnitOfMeasureData) {
    const url = `integration/integration-data/item-unit-of-measures`;
    return this.http.put(url, itemUnitOfMeasureData).pipe(map(res => res.data));
  }
}
