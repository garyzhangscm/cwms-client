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
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const data = this.gzLocalStorageService.getItem('resource.file-upload-types');
    if (data !== null) {
      return of(data);
    }
    return (
      this.http
        .get('resource/assets/fileUploadTypes')
        // .get('inventory/test-data')
        .pipe(map(res => res.data))
        .pipe(tap(res => this.gzLocalStorageService.setItem('resource.file-upload-types', res)))
    );
  }
}
