 
import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CustomerReturnOrder } from '../models/customer-return-order';

@Injectable({
  providedIn: 'root'
})
export class CustomerReturnOrderService {
  private RECEIPT_LINE_PER_PAGE = 20;

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private printingService: PrintingService,
    private utilService: UtilService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  getCustomerReturnOrders(number?: string, loadDetails?: boolean, statusList?: string,): Observable<CustomerReturnOrder[]> {
    let url = `inbound/customer-return-orders?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    

    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    if (loadDetails !== undefined && loadDetails!= null) {
      url = `${url}&loadDetails=${loadDetails}`;
    }
    if (statusList) {
      url = `${url}&receipt_status_list=${statusList}`;
    }


    return this.http.get(url).pipe(map(res => res.data));
  }

  getCustomerReturnOrder(id: number): Observable<CustomerReturnOrder> {
    return this.http.get(`inbound/customer-return-orders/${id}`).pipe(map(res => res.data));
  }

  addCustomerReturnOrder(customerReturnOrder: CustomerReturnOrder): Observable<CustomerReturnOrder> {
    return this.http.post(`inbound/customer-return-orders`, customerReturnOrder).pipe(map(res => res.data));
  }

  changeCustomerReturnOrder(customerReturnOrder: CustomerReturnOrder): Observable<CustomerReturnOrder> {
    const url = `inbound/customer-return-orders/${customerReturnOrder.id}`;
    return this.http.put(url, customerReturnOrder).pipe(map(res => res.data));
  }

  removeCustomerReturnOrder(customerReturnOrder: CustomerReturnOrder): Observable<CustomerReturnOrder> {
    const url = `inbound/customer-return-orders/${customerReturnOrder.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 
  closeCustomerReturnOrder(customerReturnOrder: CustomerReturnOrder): Observable<CustomerReturnOrder> {
    return this.http.post(`inbound/customer-return-orders/${customerReturnOrder.id}/complete`).pipe(map(res => res.data));
  }
  getReceivedInventory(customerReturnOrder: CustomerReturnOrder): Observable<Inventory[]> {
    return this.http.get(`inbound/customer-return-orders/${customerReturnOrder.id}/inventories`).pipe(map(res => res.data));
  }


  printReceivingDocument(customerReturnOrder: CustomerReturnOrder, locale?: string): Observable<ReportHistory> {


    if (!locale) {
      locale = this.i18n.defaultLang;
    }

    return this.http.post(`inbound/customer-return-orders/${customerReturnOrder.id}/receiving-document?locale=${locale}`).pipe(map(res => res.data));
  }

  printPutawayDocument(customerReturnOrder: CustomerReturnOrder, inventoryIds: number[], 
    notPutawayInventoryOnly = false, locale?: string): Observable<ReportHistory> {


    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    let url = `inbound/customer-return-orders/${customerReturnOrder.id}/putaway-document?locale=${locale}`
    if (inventoryIds.length > 0) {
      url = `${url}&inventoryIds=${inventoryIds.join(',')}`;
    }
    url = `${url}&notPutawayInventoryOnly=${notPutawayInventoryOnly}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
