import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationTransactionHistory } from '../models/allocation-transaction-history';

@Injectable({
  providedIn: 'root'
})
export class AllocationTransactionHistoryService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAllocationTransactionHistories(number?: string, transactionGroupId?: string,
      orderNumber?: string, workOrderNumber?: string, itemName?: string, locationName?: string,
      loadDetails?: boolean): Observable<AllocationTransactionHistory[]> {
    let url = `outbound/allocation-transaction-histories?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    if (transactionGroupId) {
      url = `${url}&transactionGroupId=${httpUrlEncodingCodec.encodeValue(transactionGroupId.trim())}`;
    }
    if (orderNumber) {
      url = `${url}&orderNumber=${httpUrlEncodingCodec.encodeValue(orderNumber.trim())}`;
    }
    if (workOrderNumber) {
      url = `${url}&workOrderNumber=${httpUrlEncodingCodec.encodeValue(workOrderNumber.trim())}`;
    }
    if (itemName) {
      url = `${url}&itemName=${httpUrlEncodingCodec.encodeValue(itemName.trim())}`;
    }
    if (locationName) {
      url = `${url}&locationName=${httpUrlEncodingCodec.encodeValue(locationName.trim())}`;
    }
    if (loadDetails !== undefined && loadDetails!= null) {
      url = `${url}&loadDetails=${loadDetails}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

   
}
