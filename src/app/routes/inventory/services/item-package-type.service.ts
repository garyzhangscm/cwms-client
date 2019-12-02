import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';

@Injectable({
  providedIn: 'root',
})
export class ItemPackageTypeService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}
}
