
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Printer } from '../models/printer';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private utilService: UtilService) {}

  getPrinters(name?: string, printerType?: string): Observable<Printer[]> {
    let url = `resource/printers?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`; 
    if (name) {
      url = `${url}&name=${this.utilService.encodeValue(name.trim())}`;
    } 
    if (printerType) { 
      url = `${url}&printerType=${this.utilService.encodeValue(printerType.trim())}`;
    } 


    return this.http.get(url).pipe(map(res => res.data));
  }

  getPrinter(id: number): Observable<Printer> {
    return this.http.get(`resource/printers/${id}`).pipe(map(res => res.data));
  } 
 
  addPrinter(printer: Printer): Observable<Printer> {
    return this.http.put(`resource/printers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, printer).pipe(map(res => res.data));
  }

  changePrinter(printer: Printer): Observable<Printer> {
    const url = `resource/printers/${printer.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.post(url, printer).pipe(map(res => res.data));
  }

  removePrinter(printer: Printer): Observable<Printer> {
    const url = `resource/printers/${printer.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

}
