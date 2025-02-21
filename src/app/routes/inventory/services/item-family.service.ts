import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ItemFamily } from '../models/item-family';

@Injectable({
  providedIn: 'root',
})
export class ItemFamilyService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}

  loadItemFamilies(refresh: boolean = false): Observable<ItemFamily[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    /***
     * 
     * 
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('inventory.ItemFamily');
      if (data !== null) {
        return of(data);
      }
    }
     */
    return this.http
      .get(`inventory/item-families?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem('inventory.ItemFamily', res)));
  }
  getItemFamily(itemFamilyId: number): Observable<ItemFamily> {
    const data = this.localStorageService.getItem(`inventory.ItemFamily.${  itemFamilyId}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`inventory/item-family/${  itemFamilyId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`inventory.ItemFamily.${  itemFamilyId}`, res)));
  }

  addItemFamily(itemFamily: ItemFamily): Observable<ItemFamily> {
    return this.http.post('inventory/item-family', itemFamily).pipe(map(res => res.data));
  }

  changeItemFamily(itemFamily: ItemFamily): Observable<ItemFamily> {
    const url = `inventory/item-family/${  itemFamily.id}`;
    return this.http.put(url, itemFamily).pipe(map(res => res.data));
  }

  removeItemFamily(itemFamily: ItemFamily): Observable<ItemFamily> {
    const url = `inventory/item-family/${  itemFamily.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeItemFamilies(itemFamilies: ItemFamily[]): Observable<ItemFamily[]> {
    const itemFamilyIds: number[] = [];
    itemFamilies.forEach(itemFamily => {
      itemFamilyIds.push(itemFamily.id!);
    });
    const params = {
      item_family_ids: itemFamilyIds.join(','),
    };
    return this.http.delete('inventory/item-family', params).pipe(map(res => res.data));
  }
}
