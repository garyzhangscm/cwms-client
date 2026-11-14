
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { PrinterType } from '../models/printer-type';

@Injectable({
  providedIn: 'root'
})
export class PrinterTypeService {

  constructor(private http: _HttpClient, private companyService: CompanyService, 
    private utilService: UtilService) {}

  getPrinterTypes(name?: string): Observable<PrinterType[]> {
    let url = `resource/printer-types?companyId=${this.companyService.getCurrentCompany()!.id}`;
    if (name) { 
      url = `${url}&name=${this.utilService.encodeValue(name.trim())}`;
    } 

    return this.http.get(url).pipe(map(res => res.data));
  }

  getPrinterType(id: number): Observable<PrinterType> {
    return this.http.get(`resource/printer-types/${id}`).pipe(map(res => res.data));
  } 
 
  addPrinterType(printerType: PrinterType): Observable<PrinterType> {
    return this.http.put(`resource/printer-types?companyId=${this.companyService.getCurrentCompany()!.id}`, printerType).pipe(map(res => res.data));
  }

  changePrinterType(printerType: PrinterType): Observable<PrinterType> {
    const url = `resource/printer-types/${printerType.id}`;
    return this.http.post(url, printerType).pipe(map(res => res.data));
  }

  removePrinterType(printerType: PrinterType): Observable<PrinterType> {
    const url = `resource/printer-types/${printerType.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
