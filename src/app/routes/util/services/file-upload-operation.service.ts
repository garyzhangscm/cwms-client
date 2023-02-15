import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { FileUploadType } from '../models/file-upload-type';
import { GzLocalStorageService } from './gz-local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class FileUploadOperationService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService) {}

  getFileUploadTypes(): Observable<FileUploadType[]> {
    return this.http.get('resource/file-upload/types').pipe(map(res => res.data));
  }
  
  getInventoryFileUploadProgress(key: string): Observable<number> {
    
    let params = new HttpParams();
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);
    params = params.append("key", key);

    return this.http.get(`inventory/inventories/upload/progress`, params).pipe(map(res => res.data));
  }
}
