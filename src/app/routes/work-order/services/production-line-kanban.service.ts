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

  
  getProductionLineKanbanData(productionLineIds?: string): Observable<ProductionLineKanbanData[]> {
    let url = `workorder/production-line/kanban`;
    if (productionLineIds) {
      url = `${url}?productionLineIds=${productionLineIds}`;
    } 

    return this.http.get(url).pipe(map(res => res.data));
  }
}
