import { HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
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
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private pickService: PickService,
    private dateTimeService: DateTimeService,
    private printingService: PrintingService,
    private utilService: UtilService
  ) {}

  getWaves(number?: string): Observable<Wave[]> {
    const url = `outbound/waves`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', number);  
    } 
    params = params.append('loadAttribute', false);  

    return this.http.get(url, params).pipe(map(res => res.data));
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

  findWaveCandidate(orderNumber?: string, clientId?: number, 
    customerName?: string, customerId?: number, 
    startCreatedTime?: Date, endCreatedTime?:Date, specificCreatedDate?: Date,    
    singleOrderLineOnly?: boolean,
    singleOrderQuantityOnly?: boolean,
    singleOrderCaseQuantityOnly?: boolean): Observable<Order[]> {

    const url = `outbound/waves/candidate`; 

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (orderNumber != null) {
       params = params.append('orderNumber', orderNumber);  
    } 
    if (customerName) {
      params = params.append('customerName', this.utilService.encodeHttpParameter(customerName));  
    }
    if (customerId != null) {
      params = params.append('customerId', customerId);  
    }
    if (clientId != null) {
      params = params.append('clientId', clientId);  
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
    if (singleOrderLineOnly ) {
      params = params.append('singleOrderLineOnly', singleOrderLineOnly);  
    }  
    if (singleOrderQuantityOnly ) {
      params = params.append('singleOrderQuantityOnly', singleOrderQuantityOnly);  
    }  
    if (singleOrderCaseQuantityOnly ) {
      params = params.append('singleOrderCaseQuantityOnly', singleOrderCaseQuantityOnly);  
    }  
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  planWaveWithOrderLines(waveNumber: string, orderLines: OrderLine[]): Observable<Wave> {
    const url = `outbound/waves/plan`;

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    
    if (waveNumber) {
      params = params.append('waveNumber', waveNumber);  
    }
    const orderLineIds = orderLines.map(orderLine => orderLine.id);
    return this.http.post(url, orderLineIds, params).pipe(map(res => res.data));
  }

  allocateWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}/allocate`;

    return this.http.post(url).pipe(map(res => res.data));
  }
  cancelWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}/cancel`;

    return this.http.post(url).pipe(map(res => res.data));
  }
/**
 * 
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
 * 
 */

  
  generatePickSheet(waveId: number, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.post(`outbound/waves/${waveId}/pick-report`, null, params).pipe(map(res => res.data));
  } 
  
  generatePackingSlip(waveId: number, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.post(`outbound/waves/${waveId}/packing-slip`, null, params).pipe(map(res => res.data));
  } 

  getStagedInventory(waveId: number): Observable<Inventory[]> {
     

    return this.http.get(`outbound/waves/${waveId}/staged-inventory`).pipe(map(res => res.data));
  } 
}
