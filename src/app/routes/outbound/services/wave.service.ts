import { formatDate } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order'; 
import { Shipment } from '../models/shipment';
import { Wave } from '../models/wave';
import { WaveStatus } from '../models/wave-status.enum';
import { PickService } from './pick.service';

@Injectable({
  providedIn: 'root',
})
export class WaveService {
  readonly reservePreviewEnabled = true;
  private PICKS_PER_PAGE = 20;
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService, 
    private pickService: PickService,
    private dateTimeService: DateTimeService,
    private printingService: PrintingService,
    private utilService: UtilService
  ) {}

  getWaves(number?: string, waveStatus?: WaveStatus, includeCompletedWave?: boolean, 
    includeCancelledWave?: boolean): Observable<Wave[]> {
    const url = `outbound/waves`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', number);  
    } 
    if (waveStatus) {
      params = params.append('waveStatus', waveStatus);  
    } 
    if (includeCompletedWave != null) {
      params = params.append('includeCompletedWave', includeCompletedWave);  
    } 
    if (includeCancelledWave != null) {
      params = params.append('includeCancelledWave', includeCancelledWave);  
    } 
    params = params.append('loadAttribute', false);  

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getWave(id: number): Observable<Wave> {
    return this.http.get(`outbound/waves/${id}`).pipe(map(res => res.data));
  }

  addWave(wave: Wave): Observable<Wave> {
    return this.http.put(`outbound/waves`, wave).pipe(map(res => res.data));
  }

  changeWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}`;
    return this.http.post(url, wave).pipe(map(res => res.data));
  }
  changeWaveComment(id: number, comment: string): Observable<Wave> {
    const url = `outbound/waves/${id}/change-comment`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('comment', comment); 

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }


  removeWave(waveId: number): Observable<Wave> {
    const url = `outbound/waves/${waveId}`;
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

  findWaveableOrderCandidate(orderNumber?: string, clientId?: number, 
    customerName?: string, customerId?: number, 
    startCreatedTime?: Date, endCreatedTime?:Date, specificCreatedDate?: Date,    
    singleOrderLineOnly?: boolean,
    singleOrderQuantityOnly?: boolean,
    singleOrderCaseQuantityOnly?: boolean): Observable<Order[]> {

    const url = `outbound/waves/candidate/orders`; 

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
    
    // Order candidates use warehouse-local wall time; Shipment candidates accept zoned ISO timestamps.
    if (startCreatedTime) {
      params = params.append('startCreatedTime', formatDate(startCreatedTime, "yyyy-MM-dd'T'HH:mm:ss", 'en-US'));
    }
    if (endCreatedTime) {
      params = params.append('endCreatedTime', formatDate(endCreatedTime, "yyyy-MM-dd'T'HH:mm:ss", 'en-US'));
    }
    if (specificCreatedDate) {
      params = params.append('specificCreatedDate', this.dateTimeService.getLocalDateString(specificCreatedDate));
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
  findWaveableShipmentCandidate(orderNumber?: string, clientId?: number, 
    customerName?: string, customerId?: number, 
    startCreatedTime?: Date, endCreatedTime?:Date, specificCreatedDate?: Date,    
    singleOrderLineOnly?: boolean,
    singleOrderQuantityOnly?: boolean,
    singleOrderCaseQuantityOnly?: boolean): Observable<Shipment[]> {

    const url = `outbound/waves/candidate/shipments`; 

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
      params = params.append('specificCreatedDate', this.dateTimeService.getLocalDateString(specificCreatedDate));
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

  planWaveWithOrderLines(waveNumber: string, orderLineIds: (number | undefined)[], comment?: string): Observable<Wave> {
    const url = this.reservePreviewEnabled ? `outbound/wave-reserve/plan/orders` : `outbound/waves/plan/by-order-lines`;

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    
    if (waveNumber) {
      params = params.append('waveNumber', waveNumber);  
    }
    if (comment) {
      params = params.append('comment', comment);  
    } 
    return this.http.post(url, orderLineIds, params).pipe(map(res => res.data));
  }
  planWaveWithShipmentLines(waveNumber: string, shipmentLineIds: (number | undefined)[], comment?: string): Observable<Wave> {
    const url = this.reservePreviewEnabled ? `outbound/wave-reserve/plan/shipments` : `outbound/waves/plan/by-shipment-lines`;

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    
    if (waveNumber) {
      params = params.append('waveNumber', waveNumber);  
    }
    if (comment) {
      params = params.append('comment', comment);  
    } 
    return this.http.post(url, shipmentLineIds, params).pipe(map(res => res.data));
  }

  allocateWave(wave: Wave): Observable<any> {
    if (!this.reservePreviewEnabled) return this.http.post(`outbound/waves/${wave.id}/allocate`).pipe(map(res => res.data));
    return this.reserveAction(wave.id!, 'allocate');
  }
  private reserveRequests = new Map<number, string>();
  reserveRequestId(): string {
    const bytes = new Uint8Array(16); window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    const h = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }
  isEditableReserveDraft(wave: Wave, reserve: any): boolean {
    return wave.status === 'PLANED' && reserve?.managed === true &&
      reserve.state === 'PLANNED' && Array.isArray(reserve.pendingScans) &&
      reserve.pendingScans.length === 0 && Array.isArray(reserve.lines) &&
      reserve.lines.every((line: any) => ['wave_reserved', 'committed',
        'inprocess_quantity', 'shipped_quantity'].every(key => Number(line[key]) === 0));
  }

  reserveView(id: number): Observable<any> {
    return this.http.get(`outbound/wave-reserve/${id}`, {warehouseId: this.warehouseService.getCurrentWarehouse().id}).pipe(map(res => res.data));
  }
  reserveStates(ids: number[]): Observable<any> {
    if (!ids.length) return of({});
    const requests: Observable<any>[] = [];
    for (let i = 0; i < ids.length; i += 100) requests.push(this.http.get('outbound/wave-reserve', {warehouseId: this.warehouseService.getCurrentWarehouse().id, waveIds: ids.slice(i, i + 100).join(',')}).pipe(map(res => res.data)));
    return forkJoin(requests).pipe(map(results => Object.assign({}, ...results)));
  }
  reserveAction(id: number, action: string, extra: any = {}): Observable<any> {
    if (action === 'allocate') {
      if (!this.reserveRequests.has(id)) this.reserveRequests.set(id, this.reserveRequestId());
      extra = {...extra, requestId: this.reserveRequests.get(id)};
    }
    return this.http.post(`outbound/wave-reserve/${id}/${action}`, undefined, {warehouseId: this.warehouseService.getCurrentWarehouse().id, ...extra}).pipe(map(res => {
      if (action === 'allocate' || action === 'release') this.reserveRequests.delete(id);
      return res.data;
    }));
  }
  reservePreview(id: number, shipmentLineId: number, sourceLpn: string): Observable<any> {
    return this.http.get(`outbound/wave-reserve/${id}/scan-preview`, {warehouseId: this.warehouseService.getCurrentWarehouse().id, shipmentLineId, sourceLpn}).pipe(map(res => res.data));
  }
  reserveScan(id: number, payload: any): Observable<any> {
    return this.http.post(`outbound/wave-reserve/${id}/scan`, payload, {warehouseId: this.warehouseService.getCurrentWarehouse().id}).pipe(map(res => res.data));
  }
  cancelWave(wave: Wave): Observable<Wave> {
    const url = `outbound/waves/${wave.id}/`;

    return this.http.post(url).pipe(map(res => res.data));
  } 
  completeWave(waveId: number): Observable<Wave> {
    const url = `outbound/waves/${waveId}/complete`;

    return this.http.post(url).pipe(map(res => res.data));
  } 
  deassignShipmentLine(waveId: number, shipmentLineId: number): Observable<Wave> {
    const url = `outbound/waves/${waveId}/deassign-shipment-line?shipmentLineId=${shipmentLineId}`;

    return this.http.post(url).pipe(map(res => res.data));
  } 


  
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

  generateOrderSummary(waveId: number, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.post(`outbound/waves/${waveId}/pre-print-packing-slip`, null, params).pipe(map(res => res.data));
  } 


  getStagedInventory(waveId: number): Observable<Inventory[]> {
     

    return this.http.get(`outbound/waves/${waveId}/staged-inventory`).pipe(map(res => res.data));
  } 
  
  getStagedInventoriesCount(waveIds: string): Observable<{first: number, second: number}[]> {
     
    let params = new HttpParams();
 
    params = params.append('waveIds', waveIds); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.get(`outbound/waves/get-staged-inventory/quantity`, params).pipe(map(res => res.data));
  } 
  
  changeWaveLoadNumber(id: number, loadNumber: string): Observable<Wave> {
    const url = `outbound/waves/${id}/change-load-number`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('loadNumber', loadNumber); 

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  
  changeWaveBillOfLadingNumber(id: number, billOfLadingNumber: string): Observable<Wave> {
    const url = `outbound/waves/${id}/change-bol-number`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('billOfLadingNumber', billOfLadingNumber); 

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  
  getSortationLocations(id: number): Observable<WarehouseLocation[]> {
    const url = `outbound/waves/${id}/get-sortation-locations`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.get(url, params).pipe(map(res => res.data));
  }
}
