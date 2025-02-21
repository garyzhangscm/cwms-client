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
export class CustomReportService {

  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService, 
    private warehouseService: WarehouseService, 
  ) {}

  
  getCustomReports(name?: string): Observable<CustomReport[]> {
     

    const url = `resource/customer-reports`;
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    if (name) {
      params = params.append('name', name); 
    }
     
    
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getCustomReport(id: number): Observable<CustomReport> {
    return this.http.get(`resource/customer-reports/${id}`).pipe(map(res => res.data));
  }

  addCustomReport(customReport: CustomReport): Observable<CustomReport> {
    return this.http.put('resource/customer-reports', customReport).pipe(map(res => res.data));
  }
  
  changeCustomReport(customReport: CustomReport): Observable<CustomReport> {
    return this.http.post(`resource/customer-reports/${customReport.id!}`, customReport).pipe(map(res => res.data));
  }
  

  removeCustomReport(customReportId: number): Observable<CustomReport> {
    const url = `resource/customer-reports/${customReportId}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  
  runCustomReport(customReport: CustomReport): Observable<CustomReportExecutionHistory> {
    const url = `resource/customer-reports/${customReport.id}/run`;
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    return this.http.post(url, customReport, params).pipe(map(res => res.data));
  }
}
