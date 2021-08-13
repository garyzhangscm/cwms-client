import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionPlan } from '../models/production-plan';
import { ProductionPlanLine } from '../models/production-plan-line';
import { WorkOrder } from '../models/work-order';

@Injectable({
  providedIn: 'root',
})
export class ProductionPlanService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getProductionPlans(number: string, itemName: string): Observable<ProductionPlan[]> {
    let url = `workorder/production-plans?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getProductionPlan(id: number): Observable<ProductionPlan> {
    return this.http.get(`workorder/production-plans/${id}`).pipe(map(res => res.data));
  }

  addProductionPlan(productionPlan: ProductionPlan): Observable<ProductionPlan> {
    return this.http.post(`workorder/production-plans`, productionPlan).pipe(map(res => res.data));
  }

  changeProductionPlan(productionPlan: ProductionPlan): Observable<ProductionPlan> {
    const url = `workorder/production-plans/${productionPlan.id}`;
    return this.http.put(url, productionPlan).pipe(map(res => res.data));
  }

  removeProductionPlan(productionPlan: ProductionPlan): Observable<ProductionPlan> {
    const url = `workorder/production-plans/${productionPlan.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  createWorkOrder(productionPlanLine: ProductionPlanLine, workOrder: WorkOrder): Observable<WorkOrder[]> {
    const url = `workorder/production-plan/lines/${productionPlanLine.id}/create-work-order`;
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('workOrderNumber', workOrder.number!);
    params = params.append('expectedQuantity', workOrder.expectedQuantity!.toString());
    
    return this.http.post(url, params).pipe(map(res => res.data));
  }
}
