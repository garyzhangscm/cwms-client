import { Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrintableBarcode } from '../../common/models/printable-barcode';
import { PrintingService } from '../../common/services/printing.service';
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
    private i18n: I18NService,
  ) {}

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
      orderIds.push(order.id);
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

  printOrderPickSheet(order: Order, locale?: string) : Observable<string>{
    /****
     * 
    const reportName = `Outbound Order Pick Sheet`;
    // Get the picks for the order
    this.pickService.getPicks(undefined, order.id).subscribe(pickRes => {
      const pages: string[] = 
          this.generateOrderPickSheet(reportName, order, pickRes);
      this.printingService.print(
        reportName, 
        pages,         
        undefined, 
        undefined,
        this.generateOrderNumberBarcodes(order.number, pages.length)
        );
    });
     * 
     */
    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    
    return this.http.post(`outbound/orders/${order.id}/pick-report?locale=${locale}`).pipe(map(res => res.data));
  }
  
  generateOrderPickSheet(reportName: string, order: Order, picks: PickWork[]): string[] {
    // Pages
    const pages: string[] = [];

    // Content in each page
    const pageLines: string[] = [];

    // Setup the page header for each pages
    const pageHeader = `<h1>${reportName}</h1>
                        <h2>${order.number}</h2>
                      <table style="margin-bottom: 20px; margin-top: 75px"> 
                        <tr>
                          <td>Customer:</td><td>${order.shipToCustomer == null ? '' : order.shipToCustomer.name}</td>
                          <td>First Name:</td><td>${
                            order.shipToCustomer == null
                              ? order.shipTocontactorFirstname
                              : order.shipToCustomer.contactorFirstname
                          }</td>
                          <td>Last Name:</td><td>${
                            order.shipToCustomer == null
                              ? order.shipTocontactorLastname
                              : order.shipToCustomer.contactorLastname
                          }</td>
                        </tr>
                        <tr>
                          <td>Address:</td>
                          <td colspan="5">${
                            order.shipToCustomer == null
                              ? order.shipToAddressLine1 +
                                ' ' +
                                order.shipToAddressLine2 +
                                ', ' +
                                order.shipToAddressCity +
                                ', ' +
                                order.shipToAddressState +
                                ' ' +
                                order.shipToAddressPostcode
                              : order.shipToCustomer.addressLine1 +
                                ' ' +
                                order.shipToCustomer.addressLine2 +
                                ', ' +
                                order.shipToCustomer.addressCity +
                                ', ' +
                                order.shipToCustomer.addressState +
                                ' ' +
                                order.shipToCustomer.addressPostcode
                          }
                          </td>
                        </tr>
                      </table>`;

    const tableHeader = `
                    <table> 
                      <tr>
                        <th width="15%">Number:</th>
                        <th width="10%">Source:</th>
                        <th width="10%">Dest:</th>
                        <th width="15%">Item:</th>
                        <th width="20%">Desc:</th>
                        <th width="10%">Qty:</th>
                        <th width="10%">Qty Finished:</th>
                        <th width="10%">Qty Picked:</th>
                      </tr>`;

    picks.forEach((pick, index) => {
      if (index % this.PICKS_PER_PAGE === 0) {
        // Add a page header
        pageLines.push(pageHeader);
        // Add a table header. The table
        // will show all the picks
        pageLines.push(tableHeader);
      }

      // table lines for each pick
      pageLines.push(`
                        <tr>
                          <th>${pick.number}</th>
                          <th>${pick.sourceLocation.name}</th>
                          <th>${pick.destinationLocation.name}</th>
                          <th>${pick.item.name}</th>
                          <th>${pick.item.description}</th>
                          <th>${pick.quantity}</th>
                          <th>${pick.pickedQuantity}</th>
                          <td>______</td>
                        </tr>`);

      if ((index + 1) % this.PICKS_PER_PAGE === 0) {
        // start a new page
        pageLines.push(`</table>`);
        pages.push(pageLines.join(''));
        pageLines.length = 0;
      }
    });
    // When picks.length % this.PICKS_PER_PAGE !== 0
    // It means we haven't setup the last page correctly yet. Let's
    // add the page end and add the last page to the page list
    if (picks.length % this.PICKS_PER_PAGE !== 0) {
      pageLines.push(`</table>`);
      pages.push(pageLines.join(''));
      pageLines.length = 0;
    }

    return pages;
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

  generateOrderNumberBarcodes(
    orderNumber: string,
    pageCount: number
  ): PrintableBarcode[] {

    const barcodes: PrintableBarcode[] = [];

    for (let i = 0; i < pageCount; i++) {
      barcodes.push(
        {
          pageNumber: i,
          top: 120,
          left: 250, 
          width: 206,
          height: 50,
          barCodeType: '128B',
          barCodeValue: orderNumber,
        }
      );
    }
    
    return barcodes;

  }
}
