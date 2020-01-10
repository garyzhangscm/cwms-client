import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { Order } from '../models/order';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: _HttpClient) {}

  getOrders(number: string): Observable<Order[]> {
    const url = number ? `outbound/orders?number=${number}` : `outbound/orders`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get(`outbound/order/${id}`).pipe(map(res => res.data));
  }

  addOrder(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders`, order).pipe(map(res => res.data));
  }

  changeOrder(order: Order): Observable<Order> {
    const url = `outbound/order/${order.id}`;
    return this.http.put(url, order).pipe(map(res => res.data));
  }

  removeOrder(order: Order): Observable<Order> {
    const url = `outbound/order/${order.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeOrders(orders: Order[]): Observable<Order[]> {
    const orderIds: number[] = [];
    orders.forEach(order => {
      orderIds.push(order.id);
    });
    const params = {
      order_ids: orderIds.join(','),
    };
    return this.http.delete('outbound/order', params).pipe(map(res => res.data));
  }
}
