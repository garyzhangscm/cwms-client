import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

import { LocalStorageService } from '../../util/services/LocalStorageService';


@Injectable({
  providedIn: 'root',
})
export class TestDataUploadService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}
  getTestDataNames(): Observable<string[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const data = this.localStorageService.getItem('resource.test-data-names');
    if (data !== null) {
      return of(data);
    }
    return this.http
      .get('resource/test-data')
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem('resource.test-data-names', res)));
  }

  loadTestData(name: string): Observable<string> {
    const url = `resource/test-data/init/${name}?warehouseName=${this.warehouseService.getCurrentWarehouse().name}&companyId=${this.companyService.getCurrentCompany()?.id}`;
    return this.http.post(url).pipe(map(res => res.data));
  }

  clearAll(): Observable<string> {
    const url = `resource/test-data/clear?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()?.id}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
