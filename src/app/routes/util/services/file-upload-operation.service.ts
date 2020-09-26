import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FileUploadType } from '../models/file-upload-type';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';

@Injectable({
  providedIn: 'root',
})
export class FileUploadOperationService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}

  getFileUploadTypes(): Observable<FileUploadType[]> {
    return this.http.get('resource/file-upload/types').pipe(map(res => res.data));
  }
}
