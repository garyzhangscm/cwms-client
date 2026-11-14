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
export class BillingRateService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService) {}

  getBillingRates(warehouseId?: number, clientId?: number, billableCategory?: BillableCategory): Observable<BillingRate[]> {
    let url = `admin/billing-rates?companyId=${this.companyService.getCurrentCompany()!.id}`;
    if (warehouseId) {
      url = `${url}&warehouseId=${warehouseId}`;
    }
    if (clientId) {
      url = `${url}&clientId=${clientId}`;
    }
    if (billableCategory) {
      url = `${url}&billableCategory=${billableCategory}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
  saveBillingRates(billingRates: BillingRate[]): Observable<BillingRate[]> {
    let url = `admin/billing-rates/batch?companyId=${this.companyService.getCurrentCompany()!.id}`;
    

    return this.http.post(url, billingRates).pipe(map(res => res.data));
  }
   
}
