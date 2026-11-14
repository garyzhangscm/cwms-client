
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineAttribute } from '../models/production-line-attribute';
import { ProductionLineStatus } from '../models/production-line-status';

@Injectable({
  providedIn: 'root',
})
export class ProductionLineService {
  constructor(private http: _HttpClient, 
    private dateTimeService: DateTimeService,
    private utilService: UtilService,
    private warehouseService: WarehouseService) {}

  getProductionLines(name?: string, type?: string, loadDetails?: boolean, loadWorkOrderDetails?: boolean): Observable<ProductionLine[]> {
    const url =  `workorder/production-lines`;

      
    let params = new HttpParams();
           
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    if (name) {
      params = params.append('name', name); 

    }
    if (type) {
      params = params.append('type', type); 

    }
    if (loadDetails != null) {
      params = params.append('loadDetails', loadDetails); 
    }
    else {
      
      params = params.append('loadDetails', true); 
    }
    if (loadWorkOrderDetails != null) {
      params = params.append('loadWorkOrderDetails', loadWorkOrderDetails); 
    }
    else {
      
      params = params.append('loadWorkOrderDetails', true); 
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  getAvailableProductionLines(itemId?: number): Observable<ProductionLine[]> {
    let url = `workorder/production-lines/available?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  getAvailableProductionLinesForMPS(itemId: number): Observable<ProductionLine[]> {
    let url = `workorder/production-lines/available-for-mps?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&itemId=${itemId}`;

    
    return this.http.get(url).pipe(map(res => res.data));
  }
  getProductionLinesByIdList(productionLineIds: string[]): Observable<ProductionLine[]> {
    const idList = productionLineIds.join(',');
    const url =
      productionLineIds.length > 0
        ? `workorder/production-lines?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&ids=${idList}`
        : `workorder/production-lines?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getProductionLine(id: number): Observable<ProductionLine> {
    return this.http.get(`workorder/production-lines/${id}`).pipe(map(res => res.data));
  }

  addProductionLine(productionLine: ProductionLine): Observable<ProductionLine> {
    return this.http.post(`workorder/production-lines`, productionLine).pipe(map(res => res.data));
  }

  changeProductionLine(productionLine: ProductionLine): Observable<ProductionLine> {
    const url = `workorder/production-lines/${productionLine.id}`;
    return this.http.put(url, productionLine).pipe(map(res => res.data));
  }

  removeProductionLine(productionLine: ProductionLine): Observable<ProductionLine> {
    const url = `workorder/production-lines/${productionLine.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  disableProductionLine(productionLine: ProductionLine, disabled: boolean): Observable<ProductionLine> {
    const url = `workorder/production-lines/${productionLine.id}/disable?disabled=${disabled}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
  removeProductionLines(productionLines: ProductionLine[]): Observable<ProductionLine[]> {
    const productionLineIds: number[] = [];
    productionLines.forEach(productionLine => {
      productionLineIds.push(productionLine.id!);
    });
    const params = {
      productionLineIds: productionLineIds.join(','),
    };
    return this.http.delete('workorder/production-lines', params).pipe(map(res => res.data));
  }
  
  getProductionLineStatus(name?: string, 
    startTime?: Date, endTime?:Date,): Observable<ProductionLineStatus[]> {
    const productionLineIds: number[] = [];
     
    let url =  `workorder/production-lines/status?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
     
    
    if (name) {
      url = `${url}&name=${this.utilService.encodeValue(name.trim())}`;
    }  
    if (startTime) {
      url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
    } 
    return this.http.get(url).pipe(map(res => res.data));
  }
  getProductionLineAttributes(name: string, 
    productionLineIds?: string ): Observable<ProductionLineAttribute[]> { 
     
    let url =  `workorder/production-lines/attribute?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
     
    url = `${url}&name=${name.trim()}`; 
    
    if (productionLineIds) {
      url = `${url}&productionLineIds=${productionLineIds}`;
    } 
    return this.http.get(url).pipe(map(res => res.data));
  }
  
  getProductionLineItemAttributes(productionLineIds?: string): Observable<ProductionLineAttribute[]> { 
     return this.getProductionLineAttributes("item", productionLineIds);
  }
  getProductionLineCapacityAttributes(productionLineIds?: string): Observable<ProductionLineAttribute[]> { 
     return this.getProductionLineAttributes("capacity", productionLineIds);
  }
  getProductionLineStaffCountAttributes(productionLineIds?: string): Observable<ProductionLineAttribute[]> { 
     return this.getProductionLineAttributes("staffCount", productionLineIds);
  }
  getProductionLineTotalProcedInventoryQuantity(productionLineIds?: string,       
    startTime?: Date, endTime?:Date, date?: Date): Observable<ProductionLineAttribute[]> {

      let url =  `workorder/production-lines/produced-inventory/total-quantity?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
        
      
      if (productionLineIds) {
        url = `${url}&productionLineIds=${productionLineIds}`;
      } 
      if (startTime) {
        url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
      }
      if (endTime) {
        url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
      }
      if (date) {
        url = `${url}&date=${this.dateTimeService.getISODateString(date)}`;
      }
      return this.http.get(url).pipe(map(res => res.data));
  }
}
