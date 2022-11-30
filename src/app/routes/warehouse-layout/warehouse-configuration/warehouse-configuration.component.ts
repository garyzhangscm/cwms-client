import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingStrategy } from '../models/printing-strategy.enum';
import { WarehouseConfiguration } from '../models/warehouse-configuration';
import { CompanyService } from '../services/company.service';
import { WarehouseConfigurationService } from '../services/warehouse-configuration.service';
import { WarehouseService } from '../services/warehouse.service';

@Component({
  selector: 'app-warehouse-layout-warehouse-configuration',
  templateUrl: './warehouse-configuration.component.html',
  styleUrls: ['./warehouse-configuration.component.less'],
})
export class WarehouseLayoutWarehouseConfigurationComponent implements OnInit {

  isSpinning = false;
  currentWarehouseConfiguration: WarehouseConfiguration;
  
  printingStrategyList = PrintingStrategy;

  constructor(private http: _HttpClient, 
    private companyService: CompanyService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseConfigurationService: WarehouseConfigurationService) {
      this.currentWarehouseConfiguration = {        
        warehouse: this.warehouseService.getCurrentWarehouse(),
        threePartyLogisticsFlag: false,
        listPickEnabledFlag: false,
        newLPNPrintLabelAtReceivingFlag: false,
        newLPNPrintLabelAtProducingFlag: false,
        newLPNPrintLabelAtAdjustmentFlag: false,
        
        reuseLPNAfterRemovedFlag: false,
        reuseLPNAfterShippedFlag: false,
      }
  }

  ngOnInit(): void { 
    this.isSpinning = true;
    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe(
      {
        next: (configRes) => {
          // we should only get one configuration since
          // we are only allowed to get the configuratoin for current warehouse
          if (configRes) {
            // if we already have the configuration setup for the current warehouse
            // load it. otherwise, load the default one
            
            this.currentWarehouseConfiguration = configRes;
          }
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }
    )
  }
  confirm() {
    this.isSpinning = true;
    console.log(`start to save warehouse configuration: ${JSON.stringify(this.currentWarehouseConfiguration)}`);
    this.warehouseConfigurationService.saveWarehouseConfiguration(this.currentWarehouseConfiguration)
    .subscribe({
      next:() => {
        
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    })
  }

}
