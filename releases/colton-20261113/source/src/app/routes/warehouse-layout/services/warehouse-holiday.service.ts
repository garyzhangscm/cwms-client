 
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { WarehouseHoliday } from '../models/warehouse-holiday'; 
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseHolidayService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    ) {}

  getWarehouseHolidaysByYear(year: string): Observable<WarehouseHoliday[]> { 
 
    return this.http
      .get(`layout/warehouse-holidays/by-year/${year}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
   
  addWarehouseHoliday(warehouseHoliday: WarehouseHoliday): Observable<WarehouseHoliday> { 

    let url = `layout/warehouse-holidays?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
      
    return this.http.put(url, warehouseHoliday)
      .pipe(map(res => res.data));
  }

  removeWarehouseHoliday(warehouseHolidayId: number): Observable<WarehouseHoliday> { 

    let url = `layout/warehouse-holidays/${warehouseHolidayId}?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
      
    return this.http.delete(url)
      .pipe(map(res => res.data));
  }
}
