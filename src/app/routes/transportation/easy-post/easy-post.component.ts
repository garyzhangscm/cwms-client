import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { EasyPostConfiguration } from '../models/easy-post-configuration';
import { EasyPostConfigurationService } from '../services/easy-post-configuration.service';

@Component({
  selector: 'app-transportation-easy-post',
  templateUrl: './easy-post.component.html',
})
export class TransportationEasyPostComponent implements OnInit {

  isSpinning = false;
  currentEasyPostConfiguration!: EasyPostConfiguration;

  constructor(
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private easyPostConfigurationService: EasyPostConfigurationService) { 
      this.currentEasyPostConfiguration = {        
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        apiKey: "",
        webhookSecret:  "",    
        carriers: [],
      }
  }

  ngOnInit(): void {
    this.isSpinning = true;
    this.easyPostConfigurationService.getConfiguration().subscribe(
      {
        next: (configRes) => {
          // we should only get one configuration since
          // we are only allowed to get the configuratoin for current warehouse
          if (configRes) {
            // if we already have the configuration setup for the current warehouse
            // load it. otherwise, load the default one
            
            this.currentEasyPostConfiguration = configRes;
          }
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }); 
  }

  confirm() {}

}
