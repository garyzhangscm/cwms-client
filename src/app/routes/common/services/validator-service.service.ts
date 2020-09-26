import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
@Injectable({
  providedIn: 'root',
})
export class ValidatorServiceService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  validateNewNumber(numberType: string, value: string): Observable<string> {
    const url = `common/validator/validate-new-number/${numberType}/${value}?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
