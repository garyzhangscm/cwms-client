import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Receipt } from '../models/receipt';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  private RECEIPT_LINE_PER_PAGE = 20;

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private printingService: PrintingService,
  ) {}

  getReceipts(number: string): Observable<Receipt[]> {
    let url = `inbound/receipts?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getReceipt(id: number): Observable<Receipt> {
    return this.http.get(`inbound/receipts/${id}`).pipe(map(res => res.data));
  }

  addReceipt(receipt: Receipt): Observable<Receipt> {
    return this.http.post(`inbound/receipts`, receipt).pipe(map(res => res.data));
  }

  changeReceipt(receipt: Receipt): Observable<Receipt> {
    const url = `inbound/receipts/${receipt.id}`;
    return this.http.put(url, receipt).pipe(map(res => res.data));
  }

  removeReceipt(receipt: Receipt): Observable<Receipt> {
    const url = `inbound/receipts/${receipt.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeReceipts(receipts: Receipt[]): Observable<Receipt[]> {
    const receiptIds: number[] = [];
    receipts.forEach(receipt => {
      receiptIds.push(receipt.id!);
    });
    const params = {
      receipt_ids: receiptIds.join(','),
    };
    return this.http.delete('inbound/receipts', params).pipe(map(res => res.data));
  }

  checkInReceipt(receipt: Receipt): Observable<Receipt> {
    return this.http.put(`inbound/receipts/${receipt.id}/check-in`).pipe(map(res => res.data));
  }

  closeReceipt(receipt: Receipt): Observable<Receipt> {
    return this.http.post(`inbound/receipts/${receipt.id}/complete`).pipe(map(res => res.data));
  }
  getReceivedInventory(receipt: Receipt): Observable<Inventory[]> {
    return this.http.get(`inbound/receipts/${receipt.id}/inventories`).pipe(map(res => res.data));
  }

  printReceipt(receipt: Receipt): void {
    const reportName = `Inbound Receipt Sheet`;
    // Get the picks for the order
    this.printingService.print(reportName, this.generateReceiptReport(reportName, receipt));
  }
  generateReceiptReport(reportName: string, receipt: Receipt): string[] {
    // Pages
    const pages: string[] = [];

    // Content in each page
    const pageLines: string[] = [];

    // Setup the page header for each pages
    const pageHeader = `<h1>${reportName}</h1>
                        <h2>${receipt.number}</h2>
                      <table style="margin-bottom: 20px"> 
                        <tr>
                          <td>Supplier:</td><td colspan="7">${
                            receipt.supplier === null ? '' : receipt.supplier!.name
                          }</td>
                        </tr>
                        <tr>
                          <td>Total Items:</td><td>${receipt.totalItemCount}</td>
                          <td>Total Lines:</td><td>${receipt.totalLineCount}</td>
                          <td>Total Expected Quantity:</td><td>${receipt.totalExpectedQuantity}</td>
                          <td>Total Received Quantity:</td><td>${receipt.totalReceivedQuantity}</td>
                        </tr>
                        
                      </table>`;

    const tableHeader = `
                    <table> 
                      <tr>
                        <th width="15%">Number:</th>
                        <th width="20%">Item:</th>
                        <th width="25%">Desc:</th>
                        <th width="10%">Total Qty:</th>
                        <th width="10%">Qty Already Received:</th>
                        <th width="10%">Qty Received:</th>
                        <th width="10%">Location:</th>
                      </tr>`;

    receipt.receiptLines.forEach((receiptLine, index) => {
      if (index % this.RECEIPT_LINE_PER_PAGE === 0) {
        // Add a page header
        pageLines.push(pageHeader);
        // Add a table header. The table
        // will show all the picks
        pageLines.push(tableHeader);
      }

      // table lines for each pick
      pageLines.push(`
                        <tr>
                          <th>${receiptLine.number}</th>
                          <th>${receiptLine.item!.name}</th>
                          <th>${receiptLine.item!.description}</th>
                          <th>${receiptLine.expectedQuantity}</th>
                          <th>${receiptLine.receivedQuantity}</th>
                          <td>____________</td>
                          <td>____________</td>
                        </tr>`);

      if ((index + 1) % this.RECEIPT_LINE_PER_PAGE === 0) {
        // start a new page
        pageLines.push(`</table>`);
        pages.push(pageLines.join(''));
        pageLines.length = 0;
      }
    });
    // When picks.length % this.PICKS_PER_PAGE !== 0
    // It means we haven't setup the last page correctly yet. Let's
    // add the page end and add the last page to the page list
    if (receipt.receiptLines.length % this.RECEIPT_LINE_PER_PAGE !== 0) {
      pageLines.push(`</table>`);
      pages.push(pageLines.join(''));
      pageLines.length = 0;
    }

    return pages;
  }
}
