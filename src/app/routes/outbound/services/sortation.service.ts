import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core'; 
import {  _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Inventory } from '../../inventory/models/inventory';
 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';  
import { Sortation } from '../models/sortation';
import { SortationByShipment } from '../models/sortation-by-shipment';
import { SortationByShipmentLine } from '../models/sortation-by-shipment-line';

@Injectable({
  providedIn: 'root',
})
export class SortationService { 
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,   
  ) {}

  getSortationByWave(waveNumber: string, locationId: number): Observable<Sortation> {
    let url = `outbound/sortation/by-wave`;

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('waveNumber', waveNumber.trim());  
    params = params.append('locationId', locationId);  
 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  getSortationByShipmentById(id: number): Observable<SortationByShipment> {
    let url = `outbound/sortation/by-shipment/${id}`;

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  findPickedInventoryByItem(waveNumber: string, locationId: number, itemId: number): Observable<Inventory[]> {
    let url = `outbound/sortation/by-wave/picked-inventory-by-item`;

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('waveNumber', waveNumber.trim());  
    params = params.append('locationId', locationId);  
    params = params.append('itemId', itemId);  
 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  

  processWaveSortationByItem(number: string, itemId: number, 
    color?: string, style?: string, productSize?: string,
    inventoryAttribute1?: string,
    inventoryAttribute2?: string,
    inventoryAttribute3?: string,
    inventoryAttribute4?: string,
    inventoryAttribute5?: string,): Observable<SortationByShipmentLine> {
    let url = `outbound/sortation/by-wave/by-item`;

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('number', number.trim());  
    params = params.append('itemId', itemId);  
    if (color) {      
        params = params.append('color', color);  
    }
    if (style) {      
        params = params.append('style', style);  
    }
    if (productSize) {      
        params = params.append('productSize', productSize);  
    }
    if (inventoryAttribute1) {      
        params = params.append('inventoryAttribute1', inventoryAttribute1);  
    }
    if (inventoryAttribute2) {      
        params = params.append('inventoryAttribute2', inventoryAttribute2);  
    }
    if (inventoryAttribute3) {      
        params = params.append('inventoryAttribute3', inventoryAttribute3);  
    }
    if (inventoryAttribute4) {      
        params = params.append('inventoryAttribute4', inventoryAttribute4);  
    }
    if (inventoryAttribute5) {      
        params = params.append('inventoryAttribute5', inventoryAttribute5);  
    }
 
    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  
  processShipmentLineSortationById(id: number, quantity?: number): Observable<SortationByShipmentLine> {
    let url = `outbound/sortation/by-shipment-line/${id}`;

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    if (quantity != null && quantity > 1) {

      params = params.append('quantity', quantity);  
    } 
    else {
      
      params = params.append('quantity', 1);  
    }
 
    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  
  
}
