import { HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrintableBarcode } from '../../common/models/printable-barcode';
import { PrintingService } from '../../common/services/printing.service';
import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { OrderLine } from '../models/order-line';
import { PickWork } from '../models/pick-work';
import { PickService } from './pick.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private PICKS_PER_PAGE = 20;
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  getOrders(number: string): Observable<Order[]> {
    let url = `outbound/orders?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get(`outbound/orders/${id}`).pipe(map(res => res.data));
  }

  addOrder(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders`, order).pipe(map(res => res.data));
  }

  changeOrder(order: Order): Observable<Order> {
    const url = `outbound/orders/${order.id}`;
    return this.http.put(url, order).pipe(map(res => res.data));
  }

  removeOrder(order: Order): Observable<Order> {
    const url = `outbound/orders/${order.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeOrders(orders: Order[]): Observable<Order[]> {
    const orderIds: number[] = [];
    orders.forEach(order => {
      orderIds.push(order.id!);
    });
    const params = {
      order_ids: orderIds.join(','),
    };
    return this.http.delete('outbound/orders', params).pipe(map(res => res.data));
  }
  allocateOrder(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/allocate`).pipe(map(res => res.data));
  }
  completeOrder(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/complete`).pipe(map(res => res.data));
  }

  printOrderPickSheet(order: Order, locale?: string): Observable<ReportHistory> {
    if (!locale) {
      locale = this.i18n.defaultLang;
    }

    return this.http.post(`outbound/orders/${order.id}/pick-report?locale=${locale}`).pipe(map(res => res.data));
  }
 
  generateOrderPackingList(order: Order, locale?: string): Observable<ReportHistory> {
    if (!locale) {
      locale = this.i18n.defaultLang;
    }

    return this.http.post(`outbound/orders/${order.id}/picking-list-report?locale=${locale}`).pipe(map(res => res.data));
  }
  stageOrder(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/stage`).pipe(map(res => res.data));
  }

  loadTrailer(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/load`).pipe(map(res => res.data));
  }

  dispatchTrailer(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/dispatch`).pipe(map(res => res.data));
  }

  reassignShippingStageLocation(
    order: Order,
    locationGroupId?: number,
    locationId?: number,
  ) : Observable<Order> {
    let params = new HttpParams();
    if (locationGroupId) { 
      params = params.append('locationGroupId', locationGroupId); 
    }
    if (locationId) { 
      params = params.append('locationId', locationId); 
    }
    return this.http.post(`outbound/orders/${order.id}/change-stage-loctions`, null, params).pipe(map(res => res.data));

  }
 
}
