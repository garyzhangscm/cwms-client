import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../auth/services/user.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Report } from '../models/report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private userService: UserService) {}

  getAll(
    type?: string,
    companySpecific?: boolean,
    warehouseSpecific?: boolean,
  ): Observable<Report[]> {
    let url = `resource/reports?`; 
    
    if (type) {
      url = `${url}&type=${type}`;
    }
    if (companySpecific) {
      url = `${url}&companyId=${this.warehouseService.getCurrentWarehouse().companyId.toString()}`; 
    }
    if (warehouseSpecific) {
      url = `${url}&warehouseId=${this.warehouseService.getCurrentWarehouse().id.toString()}`; 
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  
  getReport(reportId: number): Observable<Report> {
    return this.http.get(`resource/reports/${reportId}`).pipe(map(res => res.data));
  }

  addReport(report: Report, companySpecific: boolean, warehouseSpecific: boolean): Observable<Report> {
    let url = `resource/reports?warehouseId=${this.warehouseService.getCurrentWarehouse().id.toString()}&username=${this.userService.getCurrentUsername()}&companySpecific=${companySpecific}&warehouseSpecific=${warehouseSpecific}`; 
    return this.http.put(url, report).pipe(map(res => res.data));
  }

  changeReport(report: Report): Observable<Report> {
    const url = 'resource/reports/' + report.id;
    return this.http.post(url, report).pipe(map(res => res.data));
  }

}
