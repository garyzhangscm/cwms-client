import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SystemConfiguration } from '../../util/models/system-configuration';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderConfiguration } from '../models/work-order-configuration';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderConfigurationService {

  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,) { }

  getWorkOrderConfiguration(): Observable<WorkOrderConfiguration> {
    let url = `workorder/work-order-configuration`;
    url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
    url = `${url}&warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;

    return this.http.get(url).pipe(map(res => res.data));


  }
  saveWorkOrderConfiguration(workOrderConfiguration: WorkOrderConfiguration): Observable<WorkOrderConfiguration> {
    let url = `workorder/work-order-configuration`;

    return this.http.post(url, workOrderConfiguration).pipe(map(res => res.data));


  }
  
  getCurrentShift(): Observable<any> {
    let url = `workorder/work-order-configuration/current-shift?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;

    return this.http.get(url).pipe(map(res => res.data));


  }
}
