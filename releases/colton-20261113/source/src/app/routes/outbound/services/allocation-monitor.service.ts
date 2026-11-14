import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, concat, defer, of, throwError, timer } from 'rxjs';
import { catchError, exhaustMap, map, shareReplay, switchMap, takeWhile, timeout } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { OrderService } from './order.service';
import { AllocationStrategyType } from '../models/allocation-strategy-type.enum';

export interface AllocationProgress {
  state: 'CHECKING' | 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
  orderId: number;
  orderNumber: string;
  id?: string;
  message?: string;
  errorCode?: string;
  requiresReview?: boolean;
  legacy?: boolean;
}

/** Observing a task never re-submits it, even when the response is lost. */
@Injectable({ providedIn: 'root' })
export class AllocationMonitorService {
  private capability?: Observable<boolean>;
  constructor(private http: _HttpClient, private orders: OrderService, private warehouse: WarehouseService) {}

  private params(): { warehouseId: number } { return { warehouseId: this.warehouse.getCurrentWarehouse().id! }; }

  supported(): Observable<boolean> {
    if (!this.capability) this.capability = this.http.get('outbound/allocation-tasks/capabilities', this.params()).pipe(
      timeout(15000), map((res: any) => res.data?.supported === true),
      catchError(error => error.status === 404 ? of(false) : throwError(() => error)),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.capability;
  }

  private progress(order: Order, task: any): AllocationProgress {
    return { ...task, state: ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED'].includes(task.state) ? task.state : 'UNKNOWN',
      orderId: order.id!, orderNumber: order.number };
  }

  private unknown(order: Order, legacy = false): AllocationProgress {
    return { orderId: order.id!, orderNumber: order.number, state: 'UNKNOWN', legacy,
      errorCode: 'RESULT_UNCONFIRMED', requiresReview: true };
  }

  start(order: Order): Observable<AllocationProgress> {
    return defer(() => this.orders.getOrder(order.id!)).pipe(
      timeout(15000),
      switchMap(fresh => {
        if (fresh.status === 'ALLOCATING') return this.resume(fresh);
        const lines = fresh.orderLines?.filter(line => !(line as any).nonAllocatable);
        if (!lines?.length) return of(this.progress(order, { state: 'FAILED', errorCode: 'NO_ALLOCATABLE_LINES' }));
        const missing = lines.filter(line => !line.allocationStrategyType || !Object.values(AllocationStrategyType).includes(line.allocationStrategyType)).map(line => line.number);
        if (missing.length) return of(this.progress(order, {
          state: 'FAILED', errorCode: 'INVALID_STRATEGY', message: missing.join(', ') }));
        if (fresh.status !== 'OPEN' && fresh.status !== 'INPROCESS') return of(this.progress(order, { state: 'FAILED', errorCode: 'ORDER_NOT_READY' }));
        return this.supported().pipe(switchMap(supported => supported
          ? this.http.post(`outbound/orders/${order.id}/allocation-tasks`, {
              requestId: globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
            }, this.params()).pipe(timeout(15000), switchMap((res: any) => this.watch(order, res.data)))
          : concat(of(this.progress(order, { state: 'QUEUED', legacy: true })),
              this.orders.allocateOrder(fresh).pipe(timeout(15000), switchMap(() => this.watchLegacy(order))))));
      }),
      catchError(() => of(this.unknown(order)))
    );
  }

  private watch(order: Order, task: any): Observable<AllocationProgress> {
    const initial = this.progress(order, task);
    if (!['QUEUED', 'RUNNING'].includes(initial.state)) return of(initial);
    const started = Date.now();
    return concat(of(initial), timer(2000, 2000).pipe(
      // Exhaust each read before starting another; no overlap and no business retries.
      exhaustMap(() => Date.now() - started >= 600000 ? of(this.unknown(order)) :
        this.http.get(`outbound/allocation-tasks/${task.id}`, this.params()).pipe(
          timeout(15000), map((res: any) => this.progress(order, res.data)))),
      takeWhile(p => p.state === 'QUEUED' || p.state === 'RUNNING', true)
    )).pipe(catchError(() => of(this.unknown(order))));
  }

  private watchLegacy(order: Order): Observable<AllocationProgress> {
    const started = Date.now();
    return timer(0, 2500).pipe(
      exhaustMap(() => Date.now() - started >= 120000 ? of(this.unknown(order, true)) :
        this.orders.getOrder(order.id!).pipe(timeout(15000), map(fresh => {
          if (fresh.status === 'ALLOCATING') return this.progress(order, { state: 'RUNNING', legacy: true });
          if (fresh.status === 'INPROCESS' || fresh.status === 'COMPLETE') return this.progress(order, { state: 'SUCCEEDED', legacy: true });
          return this.unknown(order, true);
        }))),
      takeWhile(p => p.state === 'RUNNING', true), catchError(() => of(this.unknown(order, true)))
    );
  }

  latest(orders: Order[]): Observable<AllocationProgress[]> {
    if (!orders.length) return of([]);
    return this.supported().pipe(switchMap(supported => supported
      ? this.http.get('outbound/allocation-tasks/latest', { ...this.params(), orderIds: orders.slice(0, 100).map(order => order.id).join(',') }).pipe(
          timeout(15000), map((res: any) => (res.data || []).map((task: any) => {
            const order = orders.find(row => row.id === task.orderId);
            return order ? this.progress(order, task) : undefined;
          }).filter(Boolean)))
      : of(orders.filter(order => order.status === 'ALLOCATING').map(order => this.progress(order, { state: 'RUNNING', legacy: true })))));
  }

  resume(order: Order): Observable<AllocationProgress> {
    return this.supported().pipe(switchMap(supported => supported
      ? this.http.get('outbound/allocation-tasks/latest', { ...this.params(), orderIds: String(order.id) }).pipe(
          timeout(15000), switchMap((res: any) => res.data?.[0] ? this.watch(order, res.data[0]) : of(this.unknown(order))))
      : this.watchLegacy(order)), catchError(() => of(this.unknown(order))));
  }
}
