import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service'; 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LightMesConfiguration } from '../models/light-mes-configuration';
import { LightMesConfigurationService } from '../services/light-mes-configuration.service';

@Component({
    selector: 'app-work-order-light-mes-configuration',
    templateUrl: './light-mes-configuration.component.html',
    standalone: false
})
export class WorkOrderLightMesConfigurationComponent implements OnInit { 
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentLightMESConfiguration!: LightMesConfiguration; 

  avaiableZoneIds : string[] = [];

  isSpinning = false; 
  displayOnly = false;

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,  
    private lightMesConfigurationService: LightMesConfigurationService, 
    private userService: UserService, ) { 
      
      userService.isCurrentPageDisplayOnly("/workorder/light-mes-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );      

      this.currentLightMESConfiguration = {

        warehouseId: warehouseService.getCurrentWarehouse().id,  

        protocol: "",
        host: "",
        port: "",
    
        accessKeyId: "",
        accessKeySecret: "",
    
        singleLightStatusQueryUrl: "",
        batchLightStatusQueryUrl: "",
        singleLightPulseQueryUrl: "",
        singleMachineDetailQueryUrl: "",
        machineListQueryUrl: "",
      };
  }

  ngOnInit(): void { 
  
    this.isSpinning = true;
    
    this.warehouseService.getAvailableZoneIds().subscribe({
      next: (zoneIds) => this.avaiableZoneIds = zoneIds
    });
    
    this.lightMesConfigurationService.getLightMesConfiguration().subscribe(
      {
        next: (lightMESConfigurationRes) => {
          if (lightMESConfigurationRes != null) {
            this.currentLightMESConfiguration = lightMESConfigurationRes;
          }
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }
    ); 
  }
 

  confirm() {
    this.isSpinning = true;
    if (this.currentLightMESConfiguration.id != null) {
      this.lightMesConfigurationService.changeLightMesConfiguration(this.currentLightMESConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
      });
    }
    else {
      this.lightMesConfigurationService.addLightMesConfiguration(this.currentLightMESConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
      });

    }
  } 

}
