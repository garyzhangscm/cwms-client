import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { IntegrationItemPackageTypeData } from '../models/integration-item-package-type-data';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemPackageTypeDataService {
  constructor(private http: _HttpClient) {}

  getItemPackageTypeData(integrationItemPackageTypeDataId?: number): Observable<IntegrationItemPackageTypeData[]> {
    let url = `integration/integration-data/item-package-types`;
    if (integrationItemPackageTypeDataId) {
      url = `${url}/${integrationItemPackageTypeDataId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  addItemPackageTypeData(itemPackageTypeData: IntegrationItemPackageTypeData) {
    const url = `integration/integration-data/item-package-types`;
    return this.http.put(url, itemPackageTypeData).pipe(map(res => res.data));
  }
}
