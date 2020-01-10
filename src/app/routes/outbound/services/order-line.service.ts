import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderLine } from '../models/order-line';

@Injectable({
  providedIn: 'root',
})
export class OrderLineService {
  constructor(private http: _HttpClient) {}

  getNextOrderLineNumber(orderId: number): Observable<string> {
    return this.http.get(`outbound/order/${orderId}/next-line-number`).pipe(map(res => res.data));
  }

  createOrderLine(orderId: number, orderLine: OrderLine): Observable<OrderLine> {
    return this.http.post(`outbound/order/${orderId}/lines`, orderLine).pipe(map(res => res.data));
  }
}
