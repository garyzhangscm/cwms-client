import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { _HttpClient } from '@delon/theme';
import {
  AimOutline, CheckCircleOutline, ClockCircleOutline, CloseOutline, ContainerOutline,
  DragOutline, EllipsisOutline, FileSearchOutline, HistoryOutline, InboxOutline, LinkOutline, LockOutline,
  LoginOutline, LogoutOutline, ReloadOutline, RollbackOutline, StopOutline, UnorderedListOutline,
} from '@ant-design/icons-angular/icons';
import { NzIconModule, provideNzIconsPatch } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Observable, Subject, forkJoin, from, of } from 'rxjs';
import { catchError, concatMap, finalize, map, mergeMap, switchMap, takeUntil, tap, timeout, toArray } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../models/order-status.enum';
import { CompanyService } from '../../warehouse-layout/services/company.service';

interface LoadOrderChoice {
  kind: 'ready' | 'planned' | 'open';
  id: number;
  number: string;
  quantity?: number;
  shortQuantity?: number;
  orderStatus?: OrderStatus;
}

@Component({
  selector: 'app-dock-live',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NzButtonModule, NzInputModule, NzSelectModule, NzModalModule, NzDropDownModule, NzMenuModule, NzIconModule, PageHeaderComponent],
  providers: [provideNzIconsPatch([
    AimOutline, CheckCircleOutline, ClockCircleOutline, CloseOutline, ContainerOutline,
    DragOutline, EllipsisOutline, FileSearchOutline, HistoryOutline, InboxOutline, LinkOutline, LockOutline,
    LoginOutline, LogoutOutline, ReloadOutline, RollbackOutline, StopOutline, UnorderedListOutline,
  ])],
  templateUrl: './dock-live.component.html',
  styleUrls: ['./dock-live.component.less', './dock-live-details.component.less'],
})
export class DockLiveComponent implements OnInit, OnDestroy {
  @Input() view: 'loads' | 'docks' = 'docks';
  createOpen = false;
  loadQuery = '';
  readonly defaultLoadStatus = 'incomplete';
  loadStatus = this.defaultLoadStatus;
  loadPage = 1;
  loadPageSize = 10;
  private appliedQuery = '';
  private appliedStatus = this.defaultLoadStatus;

  get loadStatuses(): string[] {
    return [...new Set<string>(this.loads.map(l => l.status).filter(Boolean))].sort();
  }

  get matchingLoads(): any[] {
    return this.loads.filter(load => {
      if (this.appliedStatus === this.defaultLoadStatus) {
        if (load.status === 'COMPLETED') return false;
      } else if (this.appliedStatus && load.status !== this.appliedStatus) {
        return false;
      }
      if (!this.appliedQuery) return true;
      const shipments = this.loadShipments(load);
      return [
        load.number, this.loadTrailer(load), ...this.loadOrderNumbers(load), ...shipments.flatMap(s => [
          s.number, s.customer?.name, s.customerName
        ])
      ].some(value => String(value ?? '').toLowerCase().includes(this.appliedQuery));
    });
  }

  get loadPageCount(): number {
    return Math.max(1, Math.ceil(this.matchingLoads.length / this.loadPageSize));
  }

  get visibleLoads(): any[] {
    const start = (this.loadPage - 1) * this.loadPageSize;
    return this.matchingLoads.slice(start, start + this.loadPageSize);
  }

  applyLoadFilters(): void {
    this.appliedQuery = this.loadQuery.trim().toLowerCase();
    this.appliedStatus = this.loadStatus;
    this.loadPage = 1;
  }

  clearLoadFilters(): void {
    this.loadQuery = '';
    this.loadStatus = this.defaultLoadStatus;
    this.applyLoadFilters();
  }

  loadDock(load: any): string {
    const visit = this.visits.find(v => Number(v.load_id) === Number(load.id));
    const legacy = this.assignments.find(a => Number(a.loadId) === Number(load.id));
    const dockId = visit?.dock_id ?? legacy?.dockId;
    return this.doors.find(door => Number(door.id) === Number(dockId))?.label || '';
  }

  visits: any[] = [];
  registeredTrailersForCheckin: any[] = [];

  get canSubmitCheckin(): boolean {
    if (!this.yardReady || this.busy || this.loading) return false;
    if (this.checkin.ownership !== 'OWN') return !!this.checkin.number.trim();
    return this.registeredTrailersForCheckin.some(trailer => String(trailer.id) === this.checkin.trailerId);
  }

  history: any[] = [];
  yardReady = false;
  yardDialog: 'checkin' | 'load' | 'dispatch' | 'history' | 'directory' | null = null;
  currentVisit: any = null;
  visitLoadId = '';
  departed = false;
  checkin: any = {ownership: 'EXTERNAL', purpose: 'PICKUP', number: '', trailerId: '', carrier: '', driverName: '', tractorNumber: '', notes: ''};
  waitingVisits(): any[] {return this.visits.filter(v => !v.dock_id);}
  atDockCount(): number {return this.visits.filter(v => v.state === 'AT_DOCK').length;}
  visitAt(door: any): any {return this.visits.find(v => Number(v.dock_id) === Number(door.id));}
  ownershipName(value: string): string {return ({OWN:'Own fleet',PARTNER:'Partner carrier',EXTERNAL:'External'} as any)[value] || value;}
  purposeName(value: string): string {return ({PICKUP:'Pickup',DELIVERY:'Delivery',EMPTY_DROP_OFF:'Empty drop-off',EMPTY_COLLECTION:'Empty collection'} as any)[value] || value;}
  availableLoads(): any[] {return this.loads.filter(l => l.status === 'PLANNED' && !this.visits.some(v => Number(v.load_id) === Number(l.id) && v.visit_id !== this.currentVisit?.visit_id));}
  visitShipments(v: any): any[] {const l = this.loads.find(l => Number(l.id) === Number(v.load_id));return l ? this.loadShipments(l) : [];}
  openVisit(v: any, action: 'load' | 'dispatch'): void {this.currentVisit = v;this.visitLoadId = v.load_id ? String(v.load_id) : '';this.departed = false;this.yardDialog = action;}
  openCheckin(): void {this.checkin = {ownership:'EXTERNAL',purpose:'PICKUP',number:'',trailerId:'',carrier:'',driverName:'',tractorNumber:'',notes:''};this.yardDialog='checkin';}
  openHistory(): void {
    if(this.busy) return;this.busy=true;
    this.http.get('outbound/loads/yard-visits', {warehouseId:this.warehouse.getCurrentWarehouse().id,history:true}).pipe(timeout(20000),map(r=>this.data(r)),takeUntil(this.destroy$),finalize(()=>this.busy=false)).subscribe({next:r=>{this.history=r;this.yardDialog='history';},error:e=>this.fail(e)});
  }
  submitCheckin(): void {
    const c=this.checkin;
    if (!this.canSubmitCheckin) return;
    this.yardRequest('', {...c,trailerId:c.ownership==='OWN'?Number(c.trailerId):null}, 'Trailer checked in. You can now assign a Dock or Load.');
  }
  changeVisit(v: any, action: string, extra: any = {}): void {
    if(!this.yardReady || this.busy || this.loading) return;
    this.yardRequest(`/${v.visit_id}/${action}`,{revision:v.revision,...extra}, ({'assign-load':'Load association saved.','assign-dock':'Dock assigned. Confirm arrival when the Trailer reaches the Dock.',arrive:'Arrival confirmed.','assign-and-arrive':'Dock assigned and arrival confirmed.',return:'Trailer returned to the waiting Yard.',dispatch:'Shipping completed and Trailer dispatched. Dock released.'} as any)[action]);
  }
  private yardRequest(path: string, body: any, message: string): void {
    this.busy=true;this.errors=[];this.notice='';
    this.http.post('outbound/loads/yard-visits'+path,body,{warehouseId:this.warehouse.getCurrentWarehouse().id}).pipe(timeout(30000),map(r=>this.data(r)),takeUntil(this.destroy$),finalize(()=>this.busy=false)).subscribe({next:()=>{this.yardDialog=null;this.notice=message;this.refresh();},error:e=>{this.fail(e);this.yardReady=false;this.errors.push('Refresh to verify the saved Yard status before retrying.');}});
  }
  yardDrag(event: DragEvent, v: any): void {
    if(!this.yardReady || this.loading || this.busy || (event.target as HTMLElement).closest('button,select,input,a,summary,details')) {event.preventDefault();return;}
    this.draggedTrailer={visit:v};event.dataTransfer?.setData('text/plain',String(v.visit_id));if(event.dataTransfer) event.dataTransfer.effectAllowed='move';
  }
  assignments: any[] = [];
  draggedTrailer: any = null;
  hoveredDockId: number | null = null;
  assignmentReady = false;
  loads: any[] = [];
  palletCounts: Record<number, number> = {};
  private plannedNumbersByLoad = new Map<number, string[]>();

  loadOrderNumbers(load: any): string[] {
    return [...new Set<string>([
      ...this.loadShipments(load).flatMap(shipment => shipment.orderNumbers || []),
      ...(this.plannedNumbersByLoad.get(Number(load.id)) ?? [])
    ])];
  }

  private readPlannedOrderNumbers(loads: any[], warehouseId: number,
    allowPartial = true): Observable<Map<number, string[]>> {
    if (this.view !== 'loads') return of(new Map<number, string[]>());

    let unavailable = false;
    return from(loads.filter(load => load.status === 'PLANNED')).pipe(
      mergeMap(load => this.http.get(`outbound/loads/${load.id}/shipping/order-plans`, {warehouseId}).pipe(
        timeout(10000),
        map(response => {
          const result = this.data(response);
          const numbers = (result.orders as {orderNumber: string | null}[])
            .flatMap(plan => plan.orderNumber ? [plan.orderNumber] : []);
          return [Number(load.id), numbers] as const;
        }),
        catchError(error => {
          if (!allowPartial) throw error;
          unavailable = true;
          return of([Number(load.id), [] as string[]] as const);
        })
      ), 4),
      toArray(),
      map(entries => {
        if (unavailable) this.errors.push('Some assigned Sales Orders could not be loaded. Refresh to retry.');
        return new Map(entries);
      })
    );
  }

  selectedLoadId = '';
  shipmentVisit: any = null;
  maintenanceDock: any = null;
  maintenanceReason = '';

  openDockAvailability(dock: any): void {
    if (this.busy || this.loading || !this.yardReady) return;
    this.errors = [];
    this.maintenanceDock = dock;
    this.maintenanceReason = dock.maintenanceReason || 'Maintenance';
  }

  saveDockAvailability(): void {
    const dock = this.maintenanceDock;
    if (!dock || this.busy || this.loading || !this.yardReady) return;
    this.busy = true;
    this.errors = [];
    const unavailable = !dock.maintenanceUnavailable;
    this.http.post('outbound/loads/dock-availability/' + dock.id,
      {unavailable, reason: this.maintenanceReason.trim(), revision: dock.maintenanceRevision},
      {warehouseId: this.warehouse.getCurrentWarehouse().id}).pipe(
        timeout(20000), map(result => this.data(result)), takeUntil(this.destroy$),
        finalize(() => this.busy = false)
      ).subscribe({
        next: () => {
          this.maintenanceDock = null;
          this.notice = dock.label + (unavailable ? ' is temporarily out of service.' : ' is back in service.');
          this.refresh();
        },
        error: error => {
          this.fail(error);
          this.yardReady = false;
          this.errors.push('Close this window and refresh to verify the Dock availability before retrying.');
        }
      });
  }

  trailers: any[] = [];
  doors: any[] = [];
  stops: any[] = [];
  errors: string[] = [];
  loading = false;
  busy = false;
  notice = '';
  review: any = null;
  physical = false;
  shortAccepted = false;
  newLoadNumber = '';
  newTrailerId = '';
  private data(res: any): any {
    if (res?.result != null && res.result !== 0) throw new Error(res.message || 'Request failed');
    return res?.data ?? res;
  }
  private fail(error: any): void {
    this.errors = [error?.error?.message || error?.message || 'The request could not be completed. Refresh and check its status before retrying.'];
  }
  createLoad(): void {
    if (this.busy || !this.newLoadNumber.trim()) return;
    this.busy = true; this.errors = []; this.notice = '';
    const body = {number: this.newLoadNumber.trim(), type: 'SHIPPING', status: 'PLANNED',
      warehouseId: this.warehouse.getCurrentWarehouse().id, companyId: this.company.getCurrentCompany()!.id};
    const createRequest = this.newTrailerId
      ? this.http.put(`common/trailers/${this.newTrailerId}/add-appointment`, body)
      : this.http.post('outbound/loads/unassigned', {number: body.number}, {warehouseId: body.warehouseId});
    createRequest.pipe(
      map(r => this.data(r)), takeUntil(this.destroy$), finalize(() => this.busy = false)
    ).subscribe({next: () => {this.notice = 'Load created. Use Assign Shipment to link Shipments.'; this.newLoadNumber = ''; this.createOpen = false; this.refresh();}, error: e => this.fail(e)});
  }
  loadingReviewContext: {loadNumber: string; dock?: {name: string; trailerNumber: string}} | null = null;

  canReviewDockLoad(visit: any): boolean {
    return visit.state === 'AT_DOCK' && ['PLANNED', 'LOADED'].includes(visit.load_status) &&
      !!visit.load_id && this.visitShipments(visit).length > 0;
  }

  reviewDockLoad(visit: any, dock: any): void {
    if (this.busy || this.loading || !this.yardReady || !this.canReviewDockLoad(visit)) return;
    this.preview({id: visit.load_id, number: visit.load_number}, {name: dock.label, trailerNumber: visit.trailer_number});
  }

  closeLoadingReview(): void {
    if (this.busy) return;
    this.loadingReviewContext = null;
    this.review = null;
    this.errors = [];
  }

  get canConfirmLoaded(): boolean {
    return !!this.review && ['PLANNED', 'LOADED'].includes(this.review.status) && !this.review.pendingOrders?.length &&
      this.review.lines.length > 0 && this.review.lines.every((line: {toShip: number}) => line.toShip > 0) &&
      this.physical && (!this.hasShort() || this.shortAccepted);
  }

  preview(load: {id: number; number: string}, dock?: {name: string; trailerNumber: string}): void {
    if (this.busy || this.loading) return;
    this.loadingReviewContext = {loadNumber: load.number, dock};
    this.busy = true; this.errors = []; this.review = null; this.physical = false; this.shortAccepted = false;
    this.http.get(`outbound/loads/${load.id}/shipping`, {warehouseId: this.warehouse.getCurrentWarehouse().id}).pipe(
      timeout(20000), map(r => this.data(r)), takeUntil(this.destroy$), finalize(() => this.busy = false)
    ).subscribe({next: r => this.review = r, error: e => this.fail(e)});
  }
  hasShort(): boolean {return (this.review?.lines || []).some((l: any) => l.shortQuantity > 0);}
  shipmentPicker: { id: number; number: string } | null = null;
  shipmentChoices: { id: number; number: string; status: string; orderNumbers: string[]; quantity: number; shortQuantity: number }[] = [];
  expectedShipmentIds: number[] = [];
  selectedShipmentIds = new Set<number>();
  shipmentPickerReady = false;
  shipmentPickerError = '';
  shipmentFilter = '';
  orderPlanningAvailable = false;
  openOrders: {id: number; number: string; status: OrderStatus}[] = [];
  plannedOrders: {orderId: number; orderNumber: string | null; shipmentId: number | null}[] = [];
  openOrdersPage = 1;
  openOrdersTotal = 0;
  openOrdersPages = 0;
  readonly openOrdersPageSize = 20;
  openOrdersLoading = false;
  openOrdersError = '';
  orderPickerSaveError = '';
  private openOrdersRequest = 0;
  private assignedElsewhere = new Set<string>();

  private orderNumberKey(number: string): string {
    return number.trim().toUpperCase();
  }

  private canOfferOrder(number: string): boolean {
    return !this.orderPlanningAvailable ||
      (!this.openOrdersLoading && !this.openOrdersError && !this.assignedElsewhere.has(this.orderNumberKey(number)));
  }
  private selectedPlans = new Set<number>();
  private ordersToAdd = new Map<number, string>();

  get salesOrderChoices(): LoadOrderChoice[] {
    const plansByShipment = new Map(this.plannedOrders.map(plan => [plan.shipmentId, plan]));
    const visiblePlans = new Set<number>();
    const seenNumbers = new Set<string>();
    const choices: LoadOrderChoice[] = [];
    for (const shipment of this.shipmentChoices) {
      shipment.orderNumbers.forEach(number => seenNumbers.add(number.toUpperCase()));
      const plan = plansByShipment.get(shipment.id);
      if (!plan && !this.expectedShipmentIds.includes(shipment.id) &&
          !shipment.orderNumbers.every(number => this.canOfferOrder(number))) continue;
      if (plan) visiblePlans.add(plan.orderId);
      choices.push({
        kind: plan ? 'planned' : 'ready',
        id: plan?.orderId ?? shipment.id,
        number: shipment.orderNumbers.join(', '),
        quantity: shipment.quantity,
        shortQuantity: shipment.shortQuantity
      });
    }
    for (const plan of this.plannedOrders) {
      if (plan.orderNumber) seenNumbers.add(plan.orderNumber.toUpperCase());
      if (!visiblePlans.has(plan.orderId)) {
        choices.push({kind: 'planned', id: plan.orderId, number: plan.orderNumber || 'Order #' + plan.orderId});
      }
    }
    for (const order of this.openOrders) {
      if (!seenNumbers.has(order.number.toUpperCase()) && this.canOfferOrder(order.number)) {
        choices.push({kind: 'open', id: order.id, number: order.number, orderStatus: order.status});
      }
    }
    const filter = this.shipmentFilter.trim().toLowerCase();
    return choices.filter(choice => !filter || choice.number.toLowerCase().includes(filter))
      .sort((first, second) => first.number.localeCompare(second.number));
  }

  isOrderSelected(choice: LoadOrderChoice): boolean {
    switch (choice.kind) {
      case 'ready': return this.selectedShipmentIds.has(choice.id);
      case 'planned': return this.selectedPlans.has(choice.id);
      case 'open': return this.ordersToAdd.has(choice.id);
    }
  }

  selectSalesOrder(choice: LoadOrderChoice, selected: boolean): void {
    switch (choice.kind) {
      case 'ready':
        if (selected) this.selectedShipmentIds.add(choice.id);
        else this.selectedShipmentIds.delete(choice.id);
        break;
      case 'planned':
        if (selected) this.selectedPlans.add(choice.id);
        else this.selectedPlans.delete(choice.id);
        break;
      case 'open':
        if (selected) this.ordersToAdd.set(choice.id, choice.number);
        else this.ordersToAdd.delete(choice.id);
        break;
    }
  }

  get selectedOrderCount(): number {
    const linkedPlans = this.plannedOrders.filter(plan =>
      plan.shipmentId != null && this.selectedShipmentIds.has(plan.shipmentId)).length;
    return this.selectedShipmentIds.size - linkedPlans + this.selectedPlans.size + this.ordersToAdd.size;
  }

  loadOpenOrders(page = 1): void {
    if (!this.shipmentPicker || !this.orderPlanningAvailable) return;
    const request = ++this.openOrdersRequest;
    const loadId = this.shipmentPicker.id;
    const number = this.shipmentFilter.trim();
    this.openOrdersLoading = true;
    this.openOrdersError = '';
    const warehouseId = this.warehouse.getCurrentWarehouse().id;
    const otherPlans = this.http.get('common/trailer-appointments', {warehouseId, type: 'SHIPPING'}).pipe(
      map(response => {
        const loads = this.data(response);
        if (!Array.isArray(loads)) throw new Error('Unexpected Loads response');
        return loads.filter(load => Number(load.id) !== Number(loadId));
      }),
      switchMap(loads => this.readPlannedOrderNumbers(loads, warehouseId, false))
    );
    forkJoin({
      pages: forkJoin([OrderStatus.OPEN, OrderStatus.INPROCESS].map(orderStatus =>
        this.orders.getOrdersPage({number, orderStatus}, page, this.openOrdersPageSize, 'createdTime', 'desc'))),
      otherPlans,
      otherStops: this.http.get('outbound/stops', {warehouseId}).pipe(map(response => {
        const stops = this.data(response);
        if (!Array.isArray(stops)) throw new Error('Unexpected Stops response');
        return stops.filter(stop => Number(stop.trailerAppointmentId ?? stop.trailerAppointment?.id) !== Number(loadId));
      }))
    }).pipe(timeout(25000), takeUntil(this.destroy$), finalize(() => {
      if (request === this.openOrdersRequest) this.openOrdersLoading = false;
    })).subscribe({
      next: ({pages: results, otherPlans: plans, otherStops}) => {
        if (request !== this.openOrdersRequest || loadId !== this.shipmentPicker?.id) return;
        this.assignedElsewhere = new Set([
          ...[...plans.values()].flat(),
          ...otherStops.flatMap(stop => (stop.shipments || []).flatMap((shipment: any) => shipment.orderNumbers || []))
        ].map(number => this.orderNumberKey(number)));
        this.openOrders = [...new Map(results.flatMap(result => result.items)
          .filter(order => order.id != null && [OrderStatus.OPEN, OrderStatus.INPROCESS].includes(order.status))
          .map(order => [order.id!, {id: order.id!, number: order.number, status: order.status}] as const)).values()];
        this.openOrdersPage = page;
        this.openOrdersTotal = results.reduce((sum, result) => sum + result.total, 0);
        this.openOrdersPages = Math.max(...results.map(result => Math.ceil(result.total / this.openOrdersPageSize)));

        let conflicts = false;
        for (const [id, orderNumber] of this.ordersToAdd) {
          if (this.assignedElsewhere.has(this.orderNumberKey(orderNumber))) {
            this.ordersToAdd.delete(id);
            conflicts = true;
          }
        }
        for (const shipment of this.shipmentChoices) {
          if (!this.expectedShipmentIds.includes(shipment.id) &&
              shipment.orderNumbers.some(number => this.assignedElsewhere.has(this.orderNumberKey(number))) &&
              this.selectedShipmentIds.delete(shipment.id)) conflicts = true;
        }
        if (conflicts) this.shipmentPickerError = 'Some selected Sales Orders were assigned to another Load and removed from your selection.';
      },
      error: () => {
        if (request !== this.openOrdersRequest || loadId !== this.shipmentPicker?.id) return;
        this.openOrders = [];
        this.openOrdersTotal = 0;
        this.openOrdersPages = 0;
        this.openOrdersError = 'Could not verify Sales Order availability. Search again to retry.';
      }
    });
  }

  private get shipmentSelectionChanged(): boolean {
    return this.selectedShipmentIds.size !== this.expectedShipmentIds.length ||
      this.expectedShipmentIds.some(id => !this.selectedShipmentIds.has(id));
  }

  get salesOrderSelectionChanged(): boolean {
    return this.shipmentSelectionChanged || this.ordersToAdd.size > 0 ||
      this.plannedOrders.some(plan => !this.selectedPlans.has(plan.orderId));
  }

  openShipmentPicker(load: { id: number; number: string }): void {
    if (this.busy || this.loading) return;
    this.orderPickerSaveError = '';
    this.loadShipmentChoices(load);
  }

  closeSalesOrderPicker(): void {
    if (this.busy) return;
    this.shipmentPicker = null;
    if (this.orderPickerSaveError) this.refresh();
  }

  private loadShipmentChoices(load: { id: number; number: string }, keepFilter = false): void {
    this.shipmentPicker = load;
    this.orderPlanningAvailable = false;
    this.openOrders = [];
    this.plannedOrders = [];
    this.openOrdersTotal = 0;
    this.openOrdersPages = 0;
    this.openOrdersLoading = false;
    this.openOrdersError = '';
    this.openOrdersRequest++;
    this.assignedElsewhere.clear();
    this.shipmentChoices = [];
    this.expectedShipmentIds = [];
    this.selectedShipmentIds.clear();
    this.selectedPlans.clear();
    this.ordersToAdd.clear();
    if (!keepFilter) this.shipmentFilter = '';
    this.shipmentPickerReady = false;
    this.shipmentPickerError = '';
    this.busy = true;
    const path = `outbound/loads/${load.id}/shipping`;
    const params = {warehouseId: this.warehouse.getCurrentWarehouse().id};
    this.http.get(`${path}/shipment-options`, params).pipe(
      switchMap(response => {
        const options = this.data(response);
        const plans = options.orderPlanning === true
          ? this.http.get(`${path}/order-plans`, params).pipe(map(result => this.data(result).orders))
          : of([]);
        return plans.pipe(map(orders => ({options, orders})));
      }),
      timeout(30000), takeUntil(this.destroy$), finalize(() => this.busy = false)
    ).subscribe({
      next: ({options, orders}) => {
        this.shipmentChoices = options.shipments;
        this.orderPlanningAvailable = options.orderPlanning === true;
        this.plannedOrders = orders;
        this.selectedPlans = new Set(this.plannedOrders.map(order => order.orderId));
        this.expectedShipmentIds = options.selectedIds;
        this.selectedShipmentIds = new Set(this.expectedShipmentIds);
        this.shipmentPickerReady = true;
        if (this.orderPlanningAvailable) this.loadOpenOrders();
      },
      error: error => this.shipmentPickerError = error?.error?.message || error?.message || 'Unable to load Sales Orders.'
    });
  }

  saveSalesOrders(): void {
    if (!this.shipmentPicker || this.busy || !this.shipmentPickerReady || this.openOrdersLoading || this.openOrdersError ||
      !this.salesOrderSelectionChanged || this.selectedOrderCount > 500) return;
    const load = this.shipmentPicker;
    const path = `outbound/loads/${load.id}/shipping`;
    const params = {warehouseId: this.warehouse.getCurrentWarehouse().id};
    const changes: (() => Observable<unknown>)[] = [];
    if (this.shipmentSelectionChanged) {
      const body = {expectedShipmentIds: this.expectedShipmentIds, shipmentIds: [...this.selectedShipmentIds]};
      changes.push(() => this.http.post(`${path}/shipments`, body, params));
    }
    for (const plan of this.plannedOrders) {
      if (!this.selectedPlans.has(plan.orderId)) {
        changes.push(() => this.http.delete(`${path}/order-plans/${plan.orderId}`, params));
      }
    }
    for (const orderNumber of this.ordersToAdd.values()) {
      changes.push(() => this.http.post(`${path}/order-plans`, {orderNumber}, params));
    }

    this.busy = true;
    this.orderPickerSaveError = '';
    let saved = 0;
    let reload = false;
    from(changes).pipe(
      concatMap(send => send().pipe(timeout(30000), map(response => this.data(response)))),
      tap(() => saved++),
      toArray(),
      takeUntil(this.destroy$),
      finalize(() => {
        this.busy = false;
        if (reload && this.shipmentPicker?.id === load.id) this.loadShipmentChoices(load, true);
      })
    ).subscribe({
      next: () => {
        this.shipmentPicker = null;
        this.review = null;
        this.notice = 'Sales Order selection saved.';
        this.refresh();
      },
      error: error => {
        const message = error?.error?.message || error?.message || 'Unable to save Sales Orders.';
        this.orderPickerSaveError = `${message} ${saved} of ${changes.length} updates confirmed. Check the refreshed selection before trying again.`;
        reload = true;
      }
    });
  }
  confirmLoaded(): void {
    if (this.busy || !this.canConfirmLoaded) return;
    this.busy = true; this.errors = []; this.notice = '';
    const body = {physicallyLoaded: this.physical, acceptShort: this.shortAccepted, lines: this.review.lines};
    this.http.post(`outbound/loads/${this.review.loadId}/shipping/confirm-loaded`, body,
      {warehouseId: this.warehouse.getCurrentWarehouse().id}).pipe(map(r => this.data(r)),
      takeUntil(this.destroy$), finalize(() => this.busy = false)).subscribe({next: () => {
        this.notice = 'Loading confirmed. Use Dispatch Trailer when the vehicle is leaving to complete shipping.';
        this.loadingReviewContext = null;
        this.review = null;
        this.refresh();
      }, error: e => this.fail(e)});
  }
  updated?: Date;
  private destroy$ = new Subject<void>();
  constructor(private http: _HttpClient, private warehouse: WarehouseService, private company: CompanyService, private orders: OrderService) {}
  ngOnInit(): void { this.refresh(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
  private read(path: string, params: any, label: string) {
    return this.http.get(path, params).pipe(timeout(20000), map(res => {
      if ((res.result != null && res.result !== 0) || !Array.isArray(res.data)) throw new Error('Unexpected response');
      return res.data as any[];
    }), catchError(() => { this.errors.push(`${label} could not be loaded. Please retry.`); return of([] as any[]); }));
  }
  assignment(door: any): any {return this.assignments.find(a => Number(a.dockId) === Number(door.id));}
  trailerForDoor(door: any): any {return this.trailers.find(t => Number(t.id) === Number(this.assignment(door)?.trailerId));}
  canDrag(t: any): boolean {return this.assignmentReady && !this.busy && !this.loading && this.loads.some(l => Number(l.id) === Number(t.appointmentId) && l.status === 'PLANNED');}
  dragStart(event: DragEvent, t: any): void {
    if (!this.canDrag(t)) {event.preventDefault(); return;}
    this.draggedTrailer = t; event.dataTransfer?.setData('text/plain', String(t.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }
  private canDropOnDock(door: any): boolean {
    const trailer = this.draggedTrailer;
    return !!trailer && !this.busy && !this.loading &&
      door.enabled && !door.locked && !door.reservedCode &&
      !this.visitAt(door) && !this.assignment(door) &&
      (trailer.visit ? this.yardReady : this.canDrag(trailer));
  }

  dragOver(event: DragEvent, door: any): void {
    if (!this.canDropOnDock(door)) {
      this.hoveredDockId = null;
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.hoveredDockId = door.id;
  }

  dragLeave(event: DragEvent, door: any): void {
    const row = event.currentTarget as HTMLElement;
    if (event.relatedTarget instanceof Node && row.contains(event.relatedTarget)) return;
    if (this.hoveredDockId === door.id) this.hoveredDockId = null;
  }

  endDrag(): void {
    this.draggedTrailer = null;
    this.hoveredDockId = null;
  }

  drop(event: DragEvent, door: any): void {
    event.preventDefault();
    const trailer = this.draggedTrailer;
    const allowed = this.canDropOnDock(door);
    this.endDrag();
    if (!allowed) return;
    if (trailer.visit) this.changeVisit(trailer.visit, 'assign-and-arrive', {dockId: door.id});
    else this.assignDoor(trailer, door.id);
  }
  assignDoor(t: any, dockId: number | null): void {
    if (!this.canDrag(t)) return;
    const current = this.assignments.find(a => Number(a.loadId) === Number(t.appointmentId));
    this.busy = true; this.errors = []; this.notice = '';
    this.http.post(`outbound/loads/${t.appointmentId}/dock-assignment`,
      {trailerId: t.id, dockId, revision: current?.revision || 0},
      {warehouseId: this.warehouse.getCurrentWarehouse().id}).pipe(timeout(30000),
      map(r => this.data(r)), takeUntil(this.destroy$), finalize(() => this.busy = false))
      .subscribe({next: () => {this.notice = dockId ? `Trailer ${t.number}: Dock assignment saved.` : `Trailer ${t.number}: Dock assignment released.`;this.refresh();},
        error: e => {this.fail(e);this.assignmentReady = false;this.errors.push('Refresh to verify the saved assignment before retrying.');}});
  }
  refresh(): void {
    if (this.loading) return;
    this.errors = []; this.loading = true; this.yardReady = false; this.assignmentReady = false; this.assignments = []; this.updated = undefined;
    this.trailers = []; this.doors = []; this.stops = []; this.loads = []; this.palletCounts = {}; this.plannedNumbersByLoad.clear(); this.selectedLoadId = "";
    const warehouseId = this.warehouse.getCurrentWarehouse().id;
    const docks = this.read('layout/locationgroups', {warehouseId}, 'Dock groups').pipe(switchMap(groups => {
      // Colton's verified outbound dock group; never include staging or receiving locations.
      const ids = groups.filter(g => g.name === 'SHIP_DCK' && g.locationGroupType?.dock).map(g => g.id);
      return ids.length ? this.read('layout/locations', {warehouseId, locationGroupIds: ids.join(','),
        includeEmptyLocation: true, includeDisabledLocation: true}, 'Docks') : of([]);
    }));
    forkJoin({docks, availability: this.read('outbound/loads/dock-availability', {warehouseId}, 'Dock availability'), visits: this.http.get('outbound/loads/yard-visits', {warehouseId}).pipe(timeout(20000),map(r => {const a=this.data(r);if(!Array.isArray(a)) throw new Error('Invalid Yard response');return a;}),catchError(() => {this.errors.push('Yard could not be loaded. Refresh before making changes.');return of(null);})), assignments: this.http.get('outbound/loads/dock-assignments', {warehouseId}).pipe(timeout(20000),map(r => {const a = this.data(r);if(!Array.isArray(a)) throw new Error('Invalid assignment response');return a;}),catchError(() => {this.errors.push('Dock assignments could not be loaded. Dragging is disabled; refresh to retry.');return of(null);})), loads: this.read('common/trailer-appointments', {warehouseId, type: 'SHIPPING'}, 'Loads'), trailers: this.read('common/trailers', {warehouseId, companyId: this.company.getCurrentCompany()!.id}, 'Trailers'),
      palletCounts: this.view === 'loads'
        ? this.http.get('outbound/loads/pallet-counts', {warehouseId}).pipe(
            timeout(20000), map(response => this.data(response) as Record<number, number>),
            catchError(() => of({} as Record<number, number>)))
        : of({} as Record<number, number>),
      stops: this.read('outbound/stops', {warehouseId}, 'Trailer / shipment links')}).pipe(
      switchMap(result => this.readPlannedOrderNumbers(result.loads, warehouseId).pipe(
        map(plannedNumbersByLoad => ({...result, plannedNumbersByLoad}))
      )),
      takeUntil(this.destroy$), finalize(() => this.loading = false)
    ).subscribe(result => {
      this.visits = result.visits || []; this.yardReady = result.visits !== null && this.errors.length === 0;
      this.assignments = result.assignments || []; this.assignmentReady = result.assignments !== null;
      const availability = new Map(result.availability.map((entry: any) => [String(entry.dock_id), entry]));
      this.doors = [...result.docks].sort((a, b) => a.name.localeCompare(b.name)).map(dock => ({
        id: dock.id,
        label: dock.code?.trim() || 'Code not set',
        enabled: dock.enabled && !availability.get(String(dock.id))?.unavailable,
        maintenanceUnavailable: !!availability.get(String(dock.id))?.unavailable,
        maintenanceReason: availability.get(String(dock.id))?.reason || '',
        maintenanceRevision: availability.get(String(dock.id))?.revision || 0,
        locked: dock.locked,
        reservedCode: dock.reservedCode,
      }));
      this.trailers = result.trailers.map(t => ({id: t.id, number: t.number, description: t.description, enabled: t.enabled, appointmentId: t.currentAppointment?.id, appointmentNumber: t.currentAppointment?.number}));
      const checkedInTrailerIds = new Set(this.visits.map(visit => String(visit.trailer_id)));
      this.registeredTrailersForCheckin = this.trailers.filter(trailer =>
        trailer.enabled !== false && !checkedInTrailerIds.has(String(trailer.id)));
      this.stops = result.stops;
      this.loads = result.loads;
      this.palletCounts = result.palletCounts;
      this.plannedNumbersByLoad = result.plannedNumbersByLoad;
      this.loadPage = Math.min(this.loadPage, this.loadPageCount);
      this.updated = new Date();
    });
  }
  loadStops(load: any): any[] {
    return this.stops.filter(s => String(s.trailerAppointmentId ?? s.trailerAppointment?.id) === String(load.id));
  }
  loadShipments(load: any): any[] {
    return [...new Map(this.loadStops(load).flatMap(s => s.shipments || []).map((s: any) => [s.id, s])).values()];
  }
  loadTrailer(load: any): string {
    const visit = this.visits.find(v => Number(v.load_id) === Number(load.id));
    return visit?.trailer_number
      || this.trailers.find(t => String(t.id) === String(load.trailerId ?? load.trailer?.id))?.number
      || this.trailers.find(t => String(t.appointmentId) === String(load.id))?.number
      || load.trailer?.number || 'Not assigned';
  }
  linkedShipments(trailer: any): string[] {
    if (!trailer.appointmentId) return [];
    return [...new Set<string>(this.stops.filter(s => s.trailerAppointmentId === trailer.appointmentId)
      .flatMap(s => (s.shipments || []).map((v: any) => v.number)))];
  }
}
