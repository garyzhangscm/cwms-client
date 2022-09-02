import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrintingService } from '../../common/services/printing.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { OrderLine } from '../models/order-line';
import { PickWork } from '../models/pick-work';
import { Wave } from '../models/wave';
import { PickService } from './pick.service';

@Injectable({
  providedIn: 'root',
})
export class WaveService {
  private PICKS_PER_PAGE = 20;

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private pickService: PickService,
    private printingService: PrintingService,
  ) {}

  getWaves(number: string): Observable<Wave[]> {
    const url = number ? `outbound/waves?number=${number}` : `outbound/waves`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getWave(id: number): Observable<Wave> {
    return this.http.get(`outbound/waves/${id}`).pipe(map(res => res.data));
  }

  addWave(wave: Wave): Observable<Wave> {
    return this.http.post(`outbound/waves`, wave).pipe(map(res => res.data));
  }

  changeWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}`;
    return this.http.put(url, wave).pipe(map(res => res.data));
  }

  removeWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeWaves(waves: Wave[]): Observable<Wave[]> {
    const waveIds: number[] = [];
    waves.forEach(wave => {
      waveIds.push(wave.id!);
    });
    const params = {
      wave_ids: waveIds.join(','),
    };
    return this.http.delete('outbound/waves', params).pipe(map(res => res.data));
  }

  findWaveCandidate(orderNumber?: string, customerName?: string): Observable<Order[]> {
    let url = `outbound/waves/candidate?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`; 
    if (orderNumber != null) {
      url = `${url}&orderNumber=${orderNumber}`;
    }
    if (customerName != null) {
      url = `${url}&customerName=${customerName}`; 
    } 

    return this.http.get(url).pipe(map(res => res.data));
  }

  createWaveWithOrderLines(waveNumber: string, orderLines: OrderLine[]): Observable<Wave> {
    let url = `outbound/waves/plan?`;
    url = `${url}warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (waveNumber) {
      url = `${url}&waveNumber=${waveNumber}`;
    }
    const orderLineIds = orderLines.map(orderLine => orderLine.id);
    return this.http.post(url, orderLineIds).pipe(map(res => res.data));
  }

  allocateWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}/allocate`;

    return this.http.post(url).pipe(map(res => res.data));
  }

  printPickSheet(wave: Wave) {
    const reportName = `Outbound Wave Pick Sheet`;
    // Get the picks for the order
    this.pickService.getPicksByWave(wave.id!).subscribe(pickRes => {
      this.printingService.print(reportName, this.generateOrderPickSheet(reportName, wave, pickRes));
    });
  }
  generateOrderPickSheet(reportName: string, wave: Wave, picks: PickWork[]): string[] {
    // Pages
    const pages: string[] = [];

    // Content in each page
    const pageLines: string[] = [];

    // Setup the page header for each pages
    const pageHeader = `<h1>${reportName}</h1>
                        <h2>${wave.number}</h2>
                      <table style="margin-bottom: 20px"> 
                        <tr>
                          <td>Customer:</td><td> </td>
                          <td>First Name:</td><td> </td>
                          <td>Last Name:</td><td </td>
                        </tr>
                        <tr>
                          <td>Address:</td>
                          <td colspan="5"> 
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
}
