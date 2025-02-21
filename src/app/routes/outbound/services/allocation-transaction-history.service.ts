 
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationTransactionHistory } from '../models/allocation-transaction-history';

@Injectable({
  providedIn: 'root'
})
export class AllocationTransactionHistoryService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private utilService: UtilService,) {}

  getAllocationTransactionHistories(number?: string, transactionGroupId?: string,
      orderNumber?: string, workOrderNumber?: string, itemName?: string, locationName?: string,
      loadDetails?: boolean): Observable<AllocationTransactionHistory[]> {
    let url = `outbound/allocation-transaction-histories?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    if (transactionGroupId) {
      url = `${url}&transactionGroupId=${this.utilService.encodeValue(transactionGroupId.trim())}`;
    }
    if (orderNumber) {
      url = `${url}&orderNumber=${this.utilService.encodeValue(orderNumber.trim())}`;
    }
    if (workOrderNumber) {
      url = `${url}&workOrderNumber=${this.utilService.encodeValue(workOrderNumber.trim())}`;
    }
    if (itemName) {
      url = `${url}&itemName=${this.utilService.encodeValue(itemName.trim())}`;
    }
    if (locationName) {
      url = `${url}&locationName=${this.utilService.encodeValue(locationName.trim())}`;
    }
    if (loadDetails !== undefined && loadDetails!= null) {
      url = `${url}&loadDetails=${loadDetails}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

   
}
