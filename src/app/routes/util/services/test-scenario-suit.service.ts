import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { TestScenarioSuit } from '../models/test-scenario-suit';

@Injectable({
  providedIn: 'root',
})
export class TestScenarioSuitService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
  ) {}

  getTestScenarioSuit(): Observable<TestScenarioSuit> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `admin/tester/suits?warehouseName=${this.warehouseService.getCurrentWarehouse().name}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  executeTestScenarioSuit(): Observable<TestScenarioSuit> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `admin/tester/runAll?warehouseName=${this.warehouseService.getCurrentWarehouse().name}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
