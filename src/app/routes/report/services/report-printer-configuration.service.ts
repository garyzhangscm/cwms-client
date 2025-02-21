import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../auth/services/user.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Report } from '../models/report';
import { ReportPrinterConfiguration } from '../models/report-printer-configuration';

@Injectable({
  providedIn: 'root'
})
export class ReportPrinterConfigurationService {
  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private userService: UserService) { }

  getAll(
    type?: string,
    criteriaValue?: string
  ): Observable<ReportPrinterConfiguration[]> {
    let url = `resource/report-printer-configuration?warehouseid=${this.warehouseService.getCurrentWarehouse().id}`;

    if (type) {
      url = `${url}&type=${type}`;
    }
    if (criteriaValue) {
      url = `${url}&criteriaValue=${criteriaValue}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }


  getReportPrinterConfiguration(id: number): Observable<ReportPrinterConfiguration> {
    return this.http.get(`resource/report-printer-configuration/${id}`).pipe(map(res => res.data));
  }

  addReportPrinterConfiguration(reportPrinterConfiguration: ReportPrinterConfiguration): Observable<ReportPrinterConfiguration> {
    let url = `resource/report-printer-configuration`;
    return this.http.put(url, reportPrinterConfiguration).pipe(map(res => res.data));
  }

  changeReportPrinterConfiguration(reportPrinterConfiguration: ReportPrinterConfiguration): Observable<ReportPrinterConfiguration> {
    const url = 'resource/report-printer-configuration/' + reportPrinterConfiguration.id;
    return this.http.post(url, reportPrinterConfiguration).pipe(map(res => res.data));
  }
  removeReportPrinterConfiguration(reportPrinterConfiguration: ReportPrinterConfiguration): Observable<ReportPrinterConfiguration> {
    const url = 'resource/report-printer-configuration/' + reportPrinterConfiguration.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
