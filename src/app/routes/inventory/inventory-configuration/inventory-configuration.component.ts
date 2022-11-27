import { Component, Inject, OnInit } from '@angular/core'; 
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryConfiguration } from '../models/inventory-configuration';
import { InventoryConfigurationType } from '../models/inventory-configuration-type';
import { InventoryConfigurationService } from '../services/inventory-configuration.service';

@Component({
  selector: 'app-inventory-inventory-configuration',
  templateUrl: './inventory-configuration.component.html',
})
export class InventoryInventoryConfigurationComponent implements OnInit {


  inventoryConfigurationMap = new Map<InventoryConfigurationType, InventoryConfiguration>();
  inventoryConfigurationTypes = InventoryConfigurationType;
  isSpinning = false;

  constructor(private http: _HttpClient, 
    private inventoryConfigurationService: InventoryConfigurationService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { }

  ngOnInit(): void { 
    this.isSpinning = true;
    this.inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        inventoryConfigurationRes.forEach(
          inventoryConfiguration => {
            if (inventoryConfiguration != null) {

              // set the warehouse and company first so we will override with 
              // the warehouse specific rules
              inventoryConfiguration.companyId = this.companyService.getCurrentCompany()!.id;
              inventoryConfiguration.warehouseId = this.warehouseService.getCurrentWarehouse().id;
              this.inventoryConfigurationMap.set(inventoryConfiguration.type, inventoryConfiguration);
            }

            
          }
        )
        
        this.isSpinning = false;
      }
      , 
      error: () =>  this.isSpinning = false
    })
  }
  saveConfiguration() {
    this.isSpinning = true;
    this.inventoryConfigurationService.saveInventoryConfigurations(
      [...this.inventoryConfigurationMap].map(entry => entry[1])).subscribe(
      {
        next: () =>  {
          this.messageService.success(this.i18n.fanyi('message.action.success'))
        
          this.isSpinning = false;
        }
        , 
        error: () =>  this.isSpinning = false
      }
        
    )

  }

} 

