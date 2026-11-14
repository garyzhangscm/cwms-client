import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Inventory } from '../models/inventory';
import { InventoryConfiguration } from '../models/inventory-configuration';
import { InventoryConfigurationType } from '../models/inventory-configuration-type';

@Injectable({
  providedIn: 'root'
})
export class InventoryConfigurationService {

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}

  
  getInventoryConfigurations(     
  ): Observable<InventoryConfiguration> {
    let url = `inventory/inventory_configuration?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    return this.http.get(url).pipe(map(res => res.data));
  }
 
  addInventoryConfiguration(    
    inventoryConfigurations: InventoryConfiguration,
  ): Observable<InventoryConfiguration> {
    let url = `inventory/inventory_configuration?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
     
    
    return this.http.put(url, inventoryConfigurations).pipe(map(res => res.data));
  }
  
  changeInventoryConfiguration(    
    inventoryConfiguration: InventoryConfiguration,
  ): Observable<InventoryConfiguration> {
    let url = `inventory/inventory_configuration/${inventoryConfiguration.id}?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
     
    
    return this.http.post(url, inventoryConfiguration).pipe(map(res => res.data));
  }
}
