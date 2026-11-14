import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationStrategyType } from '../models/allocation-strategy-type.enum';
import { OrderLine } from '../models/order-line';
import { OrderLineBillableActivity } from '../models/order-line-billable-activity';

@Injectable({
  providedIn: 'root',
})
export class OrderLineService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getOrderLine(id: number): Observable<OrderLine> {
    return this.http.get(`outbound/orders/lines/${id}`).pipe(map(res => res.data));
  }
  getNextOrderLineNumber(orderId: number): Observable<string> {
    return this.http.get(`outbound/order/${orderId}/next-line-number`).pipe(map(res => res.data));
  }

  createOrderLine(orderId: number, orderLine: OrderLine): Observable<OrderLine> {
    return this.http.post(`outbound/order/${orderId}/lines`, orderLine).pipe(map(res => res.data));
  }

  getOrderLinesByShipment(shipmentId: number): Observable<OrderLine[]> {
    const url = `outbound/orders/lines?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&shipmentId=${shipmentId}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  findProductionPlanCandidate(orderNumber?: string, itemName?: string): Observable<OrderLine[]> {
    let url = `outbound/orders/lines/production-plan-candidate?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }`;
    if (orderNumber) {
      url = `${url}&orderNumber=${orderNumber}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  
  getAvailableOrderLinesForMPS(itemId: number) : Observable<OrderLine[]>{
    let url = `outbound/orders/lines/available-for-mps?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&itemId=${itemId}`;
  
    
    return this.http.get(url).pipe(map(res => res.data));
  }
  addOrderLineBillableActivity(orderLineId: number, 
    orderLineBillableActivity: OrderLineBillableActivity): Observable<OrderLineBillableActivity> {

    const url = `outbound/orders/lines/${orderLineId}/billable-activities`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.put(url, orderLineBillableActivity, params).pipe(map(res => res.data));
  }
  removeOrderLineBillableActivity(orderLineId: number, id: number): Observable<string> {

    const url = `outbound/orders/lines/${orderLineId}/billable-activities/${id}`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.delete(url, params).pipe(map(res => res.data));
  }

  
  changeAllocationStrategyType(orderLineId: number, allocationStrategyType : AllocationStrategyType): 
      Observable<OrderLine> {

    const url = `outbound/orders/lines/${orderLineId}/change-allocation-strategy-type`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    params = params.append('allocationStrategyType', allocationStrategyType);  

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
}
