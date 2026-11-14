import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineType } from '../models/production-line-type';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineTypeService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getProductionLineTypes(name?: string, description?: string): Observable<ProductionLineType[]> {
    const url = `workorder/production-line-types`;
    
    let params = new HttpParams();
           
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (name) {
      params = params.append('name', name);  
    }
    if (description) {
      params = params.append('description', description);   
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getProductionLineType(id: number): Observable<ProductionLineType> {
    return this.http.get(`workorder/production-line-types/${id}`).pipe(map(res => res.data));
  } 
 
  addProductionLineType(productionLineType: ProductionLineType): Observable<ProductionLineType> {
    return this.http.post(`workorder/production-line-types`, productionLineType).pipe(map(res => res.data));
  }

  changeProductionLineType(productionLineType: ProductionLineType): Observable<ProductionLineType> {
    const url = `workorder/production-line-types/${productionLineType.id}`;
    return this.http.put(url, productionLineType).pipe(map(res => res.data));
  }

  removeProductionLineType(productionLineType: ProductionLineType): Observable<ProductionLineType> {
    const url = `workorder/production-line-types/${productionLineType.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
