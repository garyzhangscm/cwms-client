import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { ItemPackageType } from '../models/item-package-type';

@Injectable({
  providedIn: 'root',
})
export class ItemUnitOfMeasureService {
  constructor(private http: _HttpClient) {}
}
