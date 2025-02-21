import { HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';
import { Inventory } from '../../inventory/models/inventory';
 
import { ReportHistory } from '../../report/models/report-history';
import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { OrderBillableActivity } from '../models/order-billable-activity';
import { OrderCancellationRequest } from '../models/order-cancellation-request';
import { OrderCategory } from '../models/order-category'; 
import { OrderStatus } from '../models/order-status.enum'; 
import { TargetShippnigCartonLabel } from '../models/target-shipping-carton-labels';
import { WalmartShippnigCartonLabel } from '../models/walmart-shipping-carton-labels'; 

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private PICKS_PER_PAGE = 20;
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private dateTimeService: DateTimeService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private utilService: UtilService
  ) { }

  getOrders(number?: string, loadDetails?: boolean, orderStatus?: OrderStatus, 
    startCompleteTime?: Date, endCompleteTime?:Date, specificCompleteDate?: Date, category?: OrderCategory, 
    customerName?: string, customerId?: number, 
    startCreatedTime?: Date, endCreatedTime?:Date, specificCreatedDate?: Date,
    trailerAppointmentId?: number, clientId?: number, poNumber?: string): Observable<Order[]> {
       
    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);

    let url = `outbound/orders`;
    
    if (number) { 
      params = params.append('number',number.trim()); 
    }
    if (poNumber) { 
      params = params.append('poNumber',poNumber.trim()); 
    }
    if (loadDetails != null) {
      params = params.append('loadDetails', loadDetails);  
    }
    if (category) {
      params = params.append('category', category);   

    }
    if (orderStatus) {
      params = params.append('status', orderStatus);    
    }
    if (customerName) {
      params = params.append('customerName',  customerName.trim());  
    }
    if (customerId != null) {
      params = params.append('customerId', customerId);  
    }
    if (clientId != null) {
      params = params.append('clientId', clientId);  
    }
    if (trailerAppointmentId != null) {
      params = params.append('trailerAppointmentId', trailerAppointmentId);  
    }
    
    if (startCompleteTime) {
      params = params.append('startCompleteTime', this.dateTimeService.getISODateTimeString(startCompleteTime));  
    }
    if (endCompleteTime) {
      params = params.append('endCompleteTime', this.dateTimeService.getISODateTimeString(endCompleteTime));   
    }
    if (specificCompleteDate) {
      params = params.append('specificCompleteDate', this.dateTimeService.getISODateString(specificCompleteDate));    
    }
    
    if (startCreatedTime) {
      params = params.append('startCreatedTime', this.dateTimeService.getISODateTimeString(startCreatedTime));  
    }
    if (endCreatedTime) {
      params = params.append('endCreatedTime', this.dateTimeService.getISODateTimeString(endCreatedTime));   
    }
    if (specificCreatedDate) {
      params = params.append('specificCreatedDate', this.dateTimeService.getISODateString(specificCreatedDate));    
    }

    return this.http.get(url, params).pipe(map(res => res.data));
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
  clearCancellationRequest(orderId: number): Observable<Order> {
    const url = `outbound/orders/clear-order-cancelleation-request`;

    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);
    params = params.append('orderId', orderId);

    return this.http.post(url, null, params).pipe(map(res => res.data));
  }
  cancelOrder(orderId: number): Observable<OrderCancellationRequest> {
    const url = `outbound/orders/cancel-order`;

    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);
    params = params.append('orderId', orderId);

    return this.http.post(url, null, params).pipe(map(res => res.data));
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
    return this.http.delete('outbound/orders', params)
    .pipe(timeout(120000))
    .pipe(map(res => res.data));
  }
  allocateOrder(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/allocate`).pipe(map(res => res.data));
  }
  completeOrder(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/complete`, order).pipe(map(res => res.data));
  }

  printOrderPickSheet(order: Order, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);

    return this.http.post(`outbound/orders/${order.id}/pick-report`, null, params).pipe(map(res => res.data));
  }
 
  generateOrderPackingList(order: Order, locale?: string): Observable<ReportHistory> {
     
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);

    return this.http.post(`outbound/orders/${order.id}/packing-list-report`, null, params).pipe(map(res => res.data));
  }
  
  generateOrderBillOfLading(order: Order, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);

    return this.http.post(`outbound/orders/${order.id}/bill-of-lading-report`, null, params).pipe(map(res => res.data));
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
 
  retriggerOrderConfirmationIntegration(order: Order): Observable<Order> {
    return this.http.post(`outbound/orders/${order.id}/retrigger-order-confirm-integration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`).pipe(map(res => res.data));
  }

  getOpenOrdersForStop(number?: string): Observable<Order[]> {
    let url = `outbound/orders/open-for-stop?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (number) { 
      
      url = `${url}&number=${this.utilService.encodeValue(number)}`; 
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
 
  isOrderAllocatable(order: Order): boolean {
    // the order is allocatable when
    // 1. it is not a outsourcing order. Outsoucing order will be done by another party
    // 2. it has open quantity or pending allocation quantity
    return !this.isOutsourcingOrder(order) && order.status != OrderStatus.ALLOCATING && 
          (order.totalOpenQuantity! > 0 || order.totalPendingAllocationQuantity! > 0) &&
          order.allowForManualPick != true;
  }
  isOutsourcingOrder(order: Order): boolean {
    return order.category === OrderCategory.OUTSOURCING_ORDER
  }

  getOrdersByTrailerAppointment(trailerAppointmentId: number) : Observable<Order[]> {
    return this.getOrders(undefined, true, undefined, 
      undefined, undefined, undefined, undefined, 
      undefined, undefined, 
      undefined, undefined, undefined,
      trailerAppointmentId);
  }

  addOrderBillableActivity(orderId: number, 
    orderBillableActivity: OrderBillableActivity): Observable<OrderBillableActivity> {

    const url = `outbound/orders/${orderId}/billable-activities`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.put(url, orderBillableActivity, params).pipe(map(res => res.data));
  }
  removeOrderBillableActivity(orderId: number,  id: number): Observable<string> {

    const url = `outbound/orders/${orderId}/billable-activities/${id}`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.delete(url, params).pipe(map(res => res.data));
  }
  
  getOpenOrderCount(): Observable<number> {

    const url = `outbound/orders/open-order/count`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  getTodayOrderCount(): Observable<number> {

    const url = `outbound/orders/today-order/count`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  getTodayCompletedOrderCount(): Observable<number> {

    const url = `outbound/orders/today-complete-order/count`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  generateWalmartShippingCartonLabel(id: number, itemName?: string): Observable<ReportHistory> {

    const url = `outbound/orders/${id}/walmart-shipping-carton-labels/generate`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (itemName) {

      params = params.append('itemName', itemName);  
    }

    return this.http.post(url, null, params).pipe(map(res => res.data));
  }
  
  generateWalmartShippingCartonLabelWithPalletLabel(id: number, itemName?: string): Observable<ReportHistory[]> {

    const url = `outbound/orders/${id}/walmart-shipping-carton-labels/generate-with-pallet-label`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (itemName) {

      params = params.append('itemName', itemName);  
    }
    params = params.append('regeneratePalletLabels', "true");  

    return this.http.post(url, null, params).pipe(map(res => res.data));
  }

  getWalmartShippingCartonLabel(id: number, itemName?: string, nonAssignedOnly?: boolean, 
    nonPrintedOnly?: boolean): Observable<WalmartShippnigCartonLabel[]> {

    const url = `outbound/orders/${id}/walmart-shipping-carton-labels`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (itemName) {

      params = params.append('itemName', itemName);  
    }
    if (nonAssignedOnly != null) {
      params = params.append('nonAssignedOnly', nonAssignedOnly); 

    }
    if (nonPrintedOnly != null) {
      params = params.append('nonPrintedOnly', nonPrintedOnly); 

    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  generateTargetShippingCartonLabel(id: number, itemName?: string): Observable<ReportHistory> {

    const url = `outbound/orders/${id}/target-shipping-carton-labels/generate`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (itemName) {

      params = params.append('itemName', itemName);  
    }

    return this.http.post(url, null, params).pipe(map(res => res.data));
  }
  
  generateTargetShippingCartonLabelWithPalletLabel(id: number, itemName?: string): Observable<ReportHistory[]> {

    const url = `outbound/orders/${id}/target-shipping-carton-labels/generate-with-pallet-label`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (itemName) {

      params = params.append('itemName', itemName);  
    }
    params = params.append('regeneratePalletLabels', "true");  

    return this.http.post(url, null, params).pipe(map(res => res.data));
  }
  generateCombinedTargetShippingCartonLabelWithPalletLabel(id: number, itemName?: string): Observable<ReportHistory> {

    const url = `outbound/orders/${id}/target-shipping-carton-labels/generate-with-pallet-label/combined`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (itemName) {

      params = params.append('itemName', itemName);  
    }
    params = params.append('regeneratePalletLabels', "true");  

    return this.http.post(url, null, params).pipe(map(res => res.data));
  }

  getTargetShippingCartonLabel(id: number, itemName?: string, nonAssignedOnly?: boolean, 
    nonPrintedOnly?: boolean): Observable<TargetShippnigCartonLabel[]> {

    const url = `outbound/orders/${id}/target-shipping-carton-labels`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (itemName) {

      params = params.append('itemName', itemName);  
    }
    if (nonAssignedOnly != null) {
      params = params.append('nonAssignedOnly', nonAssignedOnly); 

    }
    if (nonPrintedOnly != null) {
      params = params.append('nonPrintedOnly', nonPrintedOnly); 

    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  
  getPickedInventorySummaryFromOrderList(orderIds: string): Observable<Inventory[]> { 
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('orderIds', orderIds);

    return this.http.get(`outbound/orders/picked-inventory-summary`, params).pipe(map(res => res.data));
  }
  
  changeCompletedTime(orderId: number,  completedTime: Date): Observable<Order> {

    const url = `outbound/orders/${orderId}/change-completed-time`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    params = params.append('completedTime', this.dateTimeService.getISODateTimeString(completedTime));  

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  

}
