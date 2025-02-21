import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { ItemProductivityReport } from '../models/item-productivity-report';
import { ProductionLine } from '../models/production-line';
import { WorkOrder } from '../models/work-order';

@Injectable({
  providedIn: 'root',
})
export class ItemProductivityReportService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private utilService: UtilService) {}

  getItemProductivityReportForCurrentShift(itemName?: string, itemFamilyName?: string): Observable<ItemProductivityReport[]> {
    let url = `workorder/item-productivity-report/current-shift`; 
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (itemFamilyName) {
      params = params.append('itemFamilyName', itemFamilyName); 
    }
    if (itemName) {
      params = params.append('itemName', itemName); 
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  } 
}
