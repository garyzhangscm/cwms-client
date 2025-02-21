import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillableCategory } from '../models/billable-category';
import { BillingRate } from '../models/billing-rate';
import { BillingRateByInventoryAge } from '../models/billing-rate-by-inventory-age';

@Injectable({
  providedIn: 'root'
})
export class BillingRateByInventoryAgeService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService) {}

  getBillingRateByInventoryAges(warehouseId?: number, clientId?: number, 
        startInventoryAge?: number, endInventoryAge?: number): Observable<BillingRateByInventoryAge[]> {
    let url = `admin/billing-rate-by-inventory-ages?companyId=${this.companyService.getCurrentCompany()!.id}`;
    if (warehouseId) {
      url = `${url}&warehouseId=${warehouseId}`;
    }
    if (clientId) {
      url = `${url}&clientId=${clientId}`;
    }
    if (startInventoryAge != null) {
      url = `${url}&startInventoryAge=${startInventoryAge}`;
    }
    if (endInventoryAge != null) {
      url = `${url}&endInventoryAge=${endInventoryAge}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  } 
  
  saveBillingRateByInventoryAges(billingRateByInventoryAges: BillingRateByInventoryAge[]): Observable<BillingRateByInventoryAge[]> {
    let url = `admin/billing-rate-by-inventory-ages/batch?companyId=${this.companyService.getCurrentCompany()!.id}`;
    

    return this.http.post(url, billingRateByInventoryAges).pipe(map(res => res.data));
  }
  
  removeBillingRateByInventoryAge(billingRateByInventoryAgeId: number): Observable<string> {
    let url = `admin/billing-rate-by-inventory-ages/${billingRateByInventoryAgeId}?companyId=${this.companyService.getCurrentCompany()!.id}`;
    

    return this.http.delete(url).pipe(map(res => res.data));
  }
   
}
