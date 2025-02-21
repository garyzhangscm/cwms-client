import { HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { PickList } from '../models/pick-list'; 
import { PickWork } from '../models/pick-work';

@Injectable({
  providedIn: 'root',
})
export class PickListService {
  PICKS_PER_PAGE = 20;
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,  
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
  ) {}

  getPickLists(number?: string, numberList?: string): Observable<PickList[]> {
    let url = `outbound/pick-lists`;

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', number.trim());  
    }
    if (numberList) {
      params = params.append('numberList', numberList.trim());  
    }  
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  getPickListsSynchronous(number?: string, numberList?: string): Promise<any> {
    let url = `outbound/pick-lists`;

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', number.trim());  
    }
    if (numberList) {
      params = params.append('numberList', numberList.trim());  
    }  
    return this.http.get(url, params).toPromise();
  }

  getPickList(id: number): Observable<PickList> {
    const url = `outbound/pick-lists/${id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  
  cancelPickList(pickListId: number, errorLocation: boolean, generateCycleCount: boolean): Observable<PickList> {
    const url = `outbound/pick-lists/${pickListId}`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`errorLocation`, errorLocation);
    params = params.append(`generateCycleCount`, generateCycleCount);

    return this.http.delete(url, params).pipe(map(res => res.data));
  }
 
  cancelPickListInBatch(picks: PickWork[], errorLocation: boolean, generateCycleCount: boolean): Observable<string> {
    if (picks.length == 0) {
      
      return of("");
    }
    const pickIds: number[] = [];
    picks.forEach(pick => {
      pickIds.push(pick.id);
    }); 

    const url = `outbound/pick-lists/cancel-in-batch`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`errorLocation`, errorLocation);
    params = params.append(`generateCycleCount`, generateCycleCount);
    params = params.append(`ids`, pickIds.join(','));

    return this.http.delete(url, params).pipe(map(res => res.data));
  }
 

  /**
   *  
  printPickListPickSheet(pickList: PickList) {
    const reportName = `Outbound Pick List Pick Sheet`;
    // Get the picks for the order
    this.pickService.getPicksByPickList(pickList.id).subscribe(pickRes => {
      this.printingService.print(reportName, this.generatePickListPickSheet(reportName, pickList, pickRes));
    });
  }
   * 
  generatePickListPickSheet(reportName: string, pickList: PickList, picks: PickWork[]): string[] {
    // Pages
    const pages: string[] = [];

    // Content in each page
    const pageLines: string[] = [];

    // Setup the page header for each pages
    const pageHeader = `<h1>${reportName}</h1>
                        <h2>${pickList.number}</h2>`;

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
   */
  
  generatePickListSheet(pickListId: number, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('locale', locale);

    return this.http.post(`outbound/pick-lists/${pickListId}/pick-report`, null, params).pipe(map(res => res.data));
  }
  generatePickListSheetInBatch(pickListIds: string, locale?: string): Observable<ReportHistory[]> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('locale', locale);
    params = params.append('ids', pickListIds);

    return this.http.post(`outbound/pick-lists/pick-report/batch`, null, params).pipe(map(res => res.data));
  }
}
