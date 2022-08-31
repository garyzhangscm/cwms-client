import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { RfConfiguration } from '../models/rf-configuration';
import { RfConfigurationService } from '../services/rf-configuration.service';

@Component({
  selector: 'app-util-rf-configuration',
  templateUrl: './rf-configuration.component.html',
})
export class UtilRfConfigurationComponent implements OnInit {
  isSpinning = false;
  
  currentRFConfiguration: RfConfiguration;

  constructor(private http: _HttpClient, 
    private rfConfigurationService: RfConfigurationService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,  ) { 
      this.currentRFConfiguration = {
        warehouseId: this.warehouseService.getCurrentWarehouse().id, 

      }
    }
 
  ngOnInit(): void { 
    this.loadCurrentConfiguration();
 }

 loadCurrentConfiguration() {
   this.isSpinning = true;
   this.rfConfigurationService.getRfConfiguration().subscribe({
     next: (configRes) => {
        if (configRes != null) {
          this.currentRFConfiguration = configRes;
        }
        else {
          this.currentRFConfiguration = {
            warehouseId: this.warehouseService.getCurrentWarehouse().id, 
    
          }
        } 
        this.isSpinning = false;
     }, 
     error: () => {
       this.isSpinning = false; 
      }

   })

 }
 
 saveConfiguration(): void {
    this.isSpinning = true;
     
    this.rfConfigurationService.saveRfConfiguration(this.currentRFConfiguration).subscribe(
      {
        next: (configRes) => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.currentRFConfiguration = configRes; 
          
          
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.fail")); 
        }
      }
    )

  }
}
