import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
@Injectable({
  providedIn: 'root',
})
export class ValidatorServiceService {
  constructor(private http: _HttpClient, private companyService: CompanyService, private warehouseService: WarehouseService) {}

  validateNewNumber(numberType: string, value: string): Observable<string> {
    const url = `common/validator/validate-new-number/${numberType}/${value}?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&companyId=${
      this.companyService.getCurrentCompany()?.id
    }`;
    return this.http.post(url).pipe(map(res => res.data));
  }
  validateExistingNumber(numberType: string, value: string): Observable<string> {
    const url = `common/validator/validate-existing-number/${numberType}/${value}?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&companyId=${
      this.companyService.getCurrentCompany()?.id
    }`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
