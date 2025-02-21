import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrintingService } from '../../common/services/printing.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Cartonization } from '../models/cartonization';
import { PickWork } from '../models/pick-work';
import { PickService } from './pick.service';

@Injectable({
  providedIn: 'root',
})
export class CartonizationService {
  PICKS_PER_PAGE = 20;
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private pickService: PickService,
    private printingService: PrintingService,
  ) {}

  getAll(number?: string, status?: string, cartonName?: string): Observable<Cartonization[]> {
    let url = `outbound/cartonization?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }
    if (status) {
      url = `${url}&status=${status}`;
    }
    if (cartonName) {
      url = `${url}&cartonName=${cartonName}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  get(id: number): Observable<Cartonization> {
    return this.http.get(`outbound/cartonization/${id}`).pipe(map(res => res.data));
  }

  add(cartonization: Cartonization): Observable<Cartonization> {
    return this.http.post(`outbound/cartonization`, cartonization).pipe(map(res => res.data));
  }

  change(cartonization: Cartonization): Observable<Cartonization> {
    const url = `outbound/cartonization/${cartonization.id}`;
    return this.http.put(url, cartonization).pipe(map(res => res.data));
  }

  printCartonizationPickSheet(cartonization: Cartonization) {
    const reportName = `Outbound Cartonization Pick Sheet`;
    // Get the picks for the order
    this.pickService.getPicksByCartonization(cartonization.id).subscribe(pickRes => {
      this.printingService.print(reportName, this.generateCartonizationPickSheet(reportName, cartonization, pickRes));
    });
  }
  generateCartonizationPickSheet(reportName: string, cartonization: Cartonization, picks: PickWork[]): string[] {
    // Pages
    const pages: string[] = [];

    // Content in each page
    const pageLines: string[] = [];

    // Setup the page header for each pages
    const pageHeader = `<h1>${reportName}</h1>
                        <h2>${cartonization.number}</h2>`;

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
                          <th>${pick.sourceLocation?.name}</th>
                          <th>${pick.destinationLocation?.name}</th>
                          <th>${pick.item?.name}</th>
                          <th>${pick.item?.description}</th>
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
}
