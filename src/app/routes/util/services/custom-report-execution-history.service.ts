import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CustomReport } from '../models/custom-report';
import { CustomReportExecutionHistory } from '../models/custom-report-execution-history';

@Injectable({
  providedIn: 'root'
})
export class CustomReportExecutionHistoryService {

  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService, 
    private warehouseService: WarehouseService, 
  ) {}

  
  getCustomReportExecutionHistories(customReportExecutionHistoryIDs?: string): Observable<CustomReportExecutionHistory[]> {
     

    const url = `resource/customer-report-execution-histories`;
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    if (customReportExecutionHistoryIDs) {
      params = params.append('customReportExecutionHistoryIDs', customReportExecutionHistoryIDs); 
    }
     
    
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  
}
