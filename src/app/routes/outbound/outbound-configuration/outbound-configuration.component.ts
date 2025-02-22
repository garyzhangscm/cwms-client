import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { SortDirection } from '../../util/models/sort-direction';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OrderStatus } from '../models/order-status.enum';
import { OutboundConfiguration } from '../models/outbound-configuration';
import { OutboundConfigurationService } from '../services/outbound-configuration.service';

@Component({
    selector: 'app-outbound-outbound-configuration',
    templateUrl: './outbound-configuration.component.html',
    standalone: false
})
export class OutboundOutboundConfigurationComponent implements OnInit {
  currentOutboundConfiguration!: OutboundConfiguration;  

  isSpinning = false;
  
  displayOnly = false;
  orderStatusList = OrderStatus;
  orderStatusListKeys = Object.keys(this.orderStatusList);

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private messageService: NzMessageService, 
    private outboundConfigurationService: OutboundConfigurationService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,    
    private userService: UserService, ) { 
      
      userService.isCurrentPageDisplayOnly("/outbound/outbound-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );      

      this.currentOutboundConfiguration = {

        warehouseId: warehouseService.getCurrentWarehouse().id, 
        shortAutoReallocation: false,
        asynchronousAllocation: false,
        asynchronousAllocationPalletThreshold: 0,
        maxPalletSize: 0,
        maxPalletHeight: 0,
        completeOrderAndShipmentWhenCompleteWave: false
      } 
  }

  ngOnInit(): void { 
  
    this.isSpinning = true;
    this.outboundConfigurationService.getOutboundConfiguration().subscribe(
      {
        next: (outboundConfigurationRes) => {
          if (outboundConfigurationRes != null) {
            this.currentOutboundConfiguration = outboundConfigurationRes;
          }
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }
    ); 
  } 

  confirmOutboundConfiguration() {
    this.isSpinning = true;
    if (this.currentOutboundConfiguration.id != null) {
      this.outboundConfigurationService.changeOutboundConfiguration(this.currentOutboundConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
      });
    }
    else {
      this.outboundConfigurationService.addOutboundConfiguration(this.currentOutboundConfiguration)
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
