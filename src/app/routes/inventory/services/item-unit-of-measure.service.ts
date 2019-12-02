import { Injectable } from '@angular/core';
import { ItemPackageType } from '../models/item-package-type';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';

@Injectable({
  providedIn: 'root',
})
export class ItemUnitOfMeasureService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}
}
