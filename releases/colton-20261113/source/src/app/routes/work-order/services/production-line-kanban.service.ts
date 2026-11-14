import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineKanbanData } from '../models/production-line-kanban-data';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineKanbanService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  
  getProductionLineKanbanData(productionLineIds?: string, productionLineNames?: string): Observable<ProductionLineKanbanData[]> {
    let url = `workorder/production-line/kanban?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (productionLineIds) {
      url = `${url}&productionLineIds=${productionLineIds}`;
    } 
    if (productionLineNames) {
      url = `${url}&productionLineNames=${productionLineNames}`;
    } 

    return this.http.get(url).pipe(map(res => res.data));
  }
}
