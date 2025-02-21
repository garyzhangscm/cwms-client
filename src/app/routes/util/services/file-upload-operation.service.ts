import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CompanyService } from '../../warehouse-layout/services/company.service';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { FileUploadResult } from '../models/file-upload-result';
import { FileUploadType } from '../models/file-upload-type';

@Injectable({
  providedIn: 'root',
})
export class FileUploadOperationService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    private companyService: CompanyService,) {}

  getFileUploadTypes(): Observable<FileUploadType[]> {
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    return this.http.get('resource/file-upload/types', params).pipe(map(res => res.data));
  }
   
  getFileUploadProgress(url: string, key: string): Observable<number> {
    
    let params = new HttpParams();
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);
    params = params.append("key", key);

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  getFileUploadResult(url: string, key: string): Observable<FileUploadResult[]> {
    
    let params = new HttpParams();
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);
    params = params.append("key", key);

    return this.http.get(url, params).pipe(map(res => res.data));
  }
}
