import { Component, Inject, OnInit } from '@angular/core'; 
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { UnitService } from '../../common/services/unit.service'; 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { SiloConfiguration } from '../models/silo-configuration';
import { SiloConfigurationService } from '../services/silo-configuration.service';

@Component({
    selector: 'app-work-order-silo-configuration',
    templateUrl: './silo-configuration.component.html',
    standalone: false
})
export class WorkOrderSiloConfigurationComponent implements OnInit {

  currentSiloConfiguration!: SiloConfiguration;
  passwordVisible = false;
  
  isSpinning = false;
  
  
  displayOnly = false;
  constructor(  
    private siloConfigurationService: SiloConfigurationService,
    private warehouseService: WarehouseService, 
    private messageService: NzMessageService,   
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { 
      userService.isCurrentPageDisplayOnly("/work-order/silo-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                       

      this.currentSiloConfiguration = { 
        
          warehouseId: this.warehouseService.getCurrentWarehouse()!.id,
      
          webAPIProtocol:  "",
          webAPIUrl:  "",
          webAPIUsername:  "",
          webAPIPassword:  "",
          enabled: true,
          inventoryInformationFromWMS: true
      }

  }

  ngOnInit(): void { 
    this.loadConfiguration();
     
  }

  loadConfiguration() {
    this.isSpinning = true;
    this.siloConfigurationService.getSiloConfiguration().subscribe({
      next: (siloConfigurationRes) => {
        if (siloConfigurationRes) {

          // if we already have the configuration setup, load it
          // otherwise, use the default one
          this.currentSiloConfiguration = siloConfigurationRes;
        }
        this.isSpinning = false;
      }
      , 
      error: () =>  this.isSpinning = false
    });
  }
   

  saveConfiguration() {
    this.isSpinning = true;
    if (this.currentSiloConfiguration.id) {
      this.siloConfigurationService.changeSiloConfiguration(this.currentSiloConfiguration)
      .subscribe({

        next: (siloConfigurationRes) =>  {
          this.messageService.success(this.i18n.fanyi('message.action.success'))
        
          this.currentSiloConfiguration = siloConfigurationRes;
          this.isSpinning = false;
          // this.loadConfiguration();
        }
        , 
        error: () =>  this.isSpinning = false
      });
    }
    else {
      this.siloConfigurationService.addSiloConfiguration(this.currentSiloConfiguration)
      .subscribe({

        next: (siloConfigurationRes) =>  {
          this.messageService.success(this.i18n.fanyi('message.action.success'))
        
          this.currentSiloConfiguration = siloConfigurationRes;
          this.isSpinning = false;
          // this.loadConfiguration();
        }
        , 
        error: () =>  this.isSpinning = false
      });

    }

  }  


}
