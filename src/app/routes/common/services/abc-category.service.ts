import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ABCCategory } from '../models/abc-category';

@Injectable({
  providedIn: 'root'
})
export class AbcCategoryService {
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageService,
    private warehouseService: WarehouseService, 

  ) {}

  loadABCCategories(refresh: boolean = true): Observable<ABCCategory[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('common.abc-category');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`common/abc-categories?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.abc-category', res)));
  }
  getABCCategory(id: number): Observable<ABCCategory> {
    const data = this.gzLocalStorageService.getItem(`common.abc-category.${id}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`common/abc-categories/${id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`common.abc-category.${id}`, res)));
  }

  addABCCategory(abcCategory: ABCCategory): Observable<ABCCategory> {
    return this.http.post('common/abc-categories', abcCategory).pipe(map(res => res.data));
  }

  changeABCCategory(abcCategory: ABCCategory): Observable<ABCCategory> {
    const url = `common/abc-categories/${abcCategory.id}`;
    return this.http.put(url, abcCategory).pipe(map(res => res.data));
  }

  removeABCCategory(abcCategory: ABCCategory): Observable<ABCCategory> {
    const url = `common/abc-categories/${abcCategory.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
 
}
