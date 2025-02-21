
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyService } from '../../warehouse-layout/services/company.service';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { FileUploadColumnMapping } from '../models/file-upload-column-mapping';
import { RF } from '../models/rf';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadColumnMappingService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}

  
  getFileUploadColumnMapping(type: string): Observable<FileUploadColumnMapping[]> {
     

    const url = `resource/file-upload/column-mapping`;
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append('type', type); 
 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  addFileUploadColumnMapping(fileUploadColumnMapping: FileUploadColumnMapping): Observable<FileUploadColumnMapping> {
     

    const url = `resource/file-upload/column-mapping`;
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
 
    return this.http.put(url, fileUploadColumnMapping, params).pipe(map(res => res.data));
  }
  
  changeFileUploadColumnMappings(fileUploadColumnMapping: FileUploadColumnMapping): Observable<FileUploadColumnMapping> {
     

    const url = `resource/file-upload/column-mapping/${fileUploadColumnMapping.id}`;
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
 
    return this.http.post(url, fileUploadColumnMapping, params).pipe(map(res => res.data));
  }
   
}
