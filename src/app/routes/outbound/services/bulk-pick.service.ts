
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../../work-order/models/production-line';
import { WorkOrder } from '../../work-order/models/work-order';
import { BulkPick } from '../models/bulk-pick';
import { PickWork } from '../models/pick-work';

@Injectable({
  providedIn: 'root',
})
export class BulkPickService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, ) {}

   
  getBulkPicks(
    number?: string,
    numberList?: string,
    waveId?: number,
    waveNumber?: string,
    itemId?: number,
    clientId?: number,
    itemNumber?: string,
    sourceLocationId?: number,
    sourceLocationName?: string,
    inventoryStatusId?: number,
    openPickOnly?: boolean,
    color?: string,
    style?: string,
    productSize?: string,
    loadDetails?: boolean,  
  ): Observable<BulkPick[]> {
     
    
    const url = `outbound/bulk-picks`;    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', number);  
    }
    if (numberList) {
      params = params.append('numberList', numberList);  
    }  
    if (waveId) {
      params = params.append('waveId', waveId);     
    } 
    if (waveNumber) {
      params = params.append('waveNumber', waveNumber.trim()); 
    }

    if (itemId) {
      params = params.append('itemId', itemId);   
    }
    if (clientId) {
      params = params.append('clientId', clientId);   
    }
    if (itemNumber) {
      params = params.append('itemNumber', itemNumber.trim());  
    }
    if (inventoryStatusId) {
      params = params.append('inventoryStatusId', inventoryStatusId);   
    }
    if (sourceLocationId) {
      params = params.append('sourceLocationId', sourceLocationId);  
    } 
    if (sourceLocationName) {
      params = params.append('sourceLocationName', sourceLocationName.trim());  
    } 
    if (openPickOnly != null) {
      params = params.append('openPickOnly', openPickOnly);  

    }
    if (color) {
      params = params.append('color', color.trim());  
    } 
    if (style) {
      params = params.append('style', style.trim());  
    } 
    if (productSize) {
      params = params.append('productSize', productSize.trim());  
    } 
    if (loadDetails != null) {
      params = params.append('loadDetails', loadDetails);  

    } 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  getBulkPicksSynchronous(
    number?: string,
    numberList?: string,
    waveId?: number,
    waveNumber?: string,
    itemId?: number,
    clientId?: number,
    itemNumber?: string,
    sourceLocationId?: number,
    sourceLocationName?: string,
    inventoryStatusId?: number,
    openPickOnly?: boolean,
    color?: string,
    style?: string,
    productSize?: string,
    loadDetails?: boolean,  
  ): Promise<any> {
     
    
    const url = `outbound/bulk-picks`;    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', number);  
    }
    if (numberList) {
      params = params.append('numberList', numberList);  
    }  
    if (waveId) {
      params = params.append('waveId', waveId);     
    } 
    if (waveNumber) {
      params = params.append('waveNumber', waveNumber.trim()); 
    }

    if (itemId) {
      params = params.append('itemId', itemId);   
    }
    if (clientId) {
      params = params.append('clientId', clientId);   
    }
    if (itemNumber) {
      params = params.append('itemNumber', itemNumber.trim());  
    }
    if (inventoryStatusId) {
      params = params.append('inventoryStatusId', inventoryStatusId);   
    }
    if (sourceLocationId) {
      params = params.append('sourceLocationId', sourceLocationId);  
    } 
    if (sourceLocationName) {
      params = params.append('sourceLocationName', sourceLocationName.trim());  
    } 
    if (openPickOnly != null) {
      params = params.append('openPickOnly', openPickOnly);  

    }
    if (color) {
      params = params.append('color', color.trim());  
    } 
    if (style) {
      params = params.append('style', style.trim());  
    } 
    if (productSize) {
      params = params.append('productSize', productSize.trim());  
    } 
    if (loadDetails != null) {
      params = params.append('loadDetails', loadDetails);  

    } 
    return this.http.get(url, params).toPromise();
  }

  getBulkPick(id: number): Observable<BulkPick> {
    return this.http.get(`outbound/bulk-picks/${id}`).pipe(map(res => res.data));
  }

   
  cancelBulkPick(bulkPickId: number, errorLocation: boolean, generateCycleCount: boolean): Observable<BulkPick> {
    const url = `outbound/bulk-picks/${bulkPickId}`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`errorLocation`, errorLocation);
    params = params.append(`generateCycleCount`, generateCycleCount);

    return this.http.delete(url, params).pipe(map(res => res.data));
  }
 

  confirmPick(
    pick: BulkPick,
    quantity?: number,
    pickToContainer?: boolean,
    containerId?: string,
  ): Observable<BulkPick> {
    const confirmedQuantity = quantity === undefined ? pick.quantity - pick.pickedQuantity : quantity;
    const url = `outbound/bulk-picks/${pick.id}/confirm`;

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  
    params = params.append('quantity', confirmedQuantity);  

    if (pickToContainer) {
      params = params.append('pickToContainer', pickToContainer);   
    }
    if (containerId) {
      params = params.append('containerId', containerId);   
    }
    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }  

  
  assignUser(pickId: number, userId: number): Observable<BulkPick> {
    const url = `outbound/bulk-picks/${pickId}/assign-user`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`userId`, userId); 

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  releasePick(pickId: number): Observable<BulkPick> {
    const url = `outbound/bulk-picks/${pickId}/release`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
}
