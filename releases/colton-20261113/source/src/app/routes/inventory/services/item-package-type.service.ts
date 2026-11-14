import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemPackageType } from '../models/item-package-type';

@Injectable({
  providedIn: 'root',
})
export class ItemPackageTypeService {
  constructor(private http: _HttpClient) {}

  
  getItemPackageType(itemPackageTypeId: number): Observable<ItemPackageType> {
    return this.http.get(`inventory/itemPackageTypes/${itemPackageTypeId}`).pipe(map(res => res.data));
  }

  isItemPackageTypeRemovable(itemPackageTypeId: number): Observable<boolean> {
    return this.http.get(`inventory/itemPackageTypes/${itemPackageTypeId}/removable`).pipe(map(res => res.data));
  }


}
