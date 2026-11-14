 
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
@Injectable({
  providedIn: 'root',
})
export class ValidatorServiceService {
  constructor(private http: _HttpClient, 
    private companyService: CompanyService, 
    private warehouseService: WarehouseService, 
    private utilService: UtilService) {}

  validateNewNumber(numberType: string, value: string): Observable<string> {
     
    if (value && value.length > 0) {
      const url = `common/validator/validate-new-number/${numberType}/${this.utilService.encodeValue(value.trim())}?warehouseId=${
        this.warehouseService.getCurrentWarehouse().id
      }&companyId=${
        this.companyService.getCurrentCompany()?.id
      }`;
      return this.http.post(url).pipe(map(res => res.data));
    }
    else {
      return of("");
    }

  }
  validateExistingNumber(numberType: string, value: string): Observable<string> {
     
    if (value && value.length > 0) {

      const url = `common/validator/validate-existing-number/${numberType}/${this.utilService.encodeValue(value.trim())}?warehouseId=${
        this.warehouseService.getCurrentWarehouse().id
      }&companyId=${
        this.companyService.getCurrentCompany()?.id
      }`;
      return this.http.post(url).pipe(map(res => res.data));
    }
    else {
      return of("");
    }
  }
}
