import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { SortDirection } from '../../util/models/sort-direction';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BulkPickConfiguration } from '../models/bulk-pick-configuration';
import { BulkPickConfigurationService } from '../services/bulk-pick-configuration.service';

@Component({
  selector: 'app-outbound-bulk-pick-configuration',
  templateUrl: './bulk-pick-configuration.component.html',
})
export class OutboundBulkPickConfigurationComponent implements OnInit {
  currentBulkPickConfiguration!: BulkPickConfiguration;
  sortDirections = SortDirection;

  isSpinning = false;
  displayOnly = false;

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private messageService: NzMessageService, 
    private bulkPickConfigurationService: BulkPickConfigurationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,    
    private userService: UserService, ) { 
      
      userService.isCurrentPageDisplayOnly("/warehouse-layout/warehouse-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );      

      this.currentBulkPickConfiguration = {

        warehouseId: warehouseService.getCurrentWarehouse().id,
        enabledForOutbound: false,
        enabledForWorkOrder: false,
        pickSortDirection: SortDirection.ASC,
      }
  }

  ngOnInit(): void { 
    this.isSpinning = true;
    this.bulkPickConfigurationService.getBulkPickConfiguration().subscribe(
      {
        next: (bulkPickConfigurationRes) => {
          if (bulkPickConfigurationRes != null) {
            this.currentBulkPickConfiguration = bulkPickConfigurationRes;
          }
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }
    )
  }

  
  pickSortDirectionChanged(sortDirection: SortDirection) : void { 
    this.currentBulkPickConfiguration.pickSortDirection = sortDirection;
  }

  confirm() {
    this.isSpinning = true;
    if (this.currentBulkPickConfiguration.id != null) {
      this.bulkPickConfigurationService.changeBulkPickConfiguration(this.currentBulkPickConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
      });
    }
    else {
      this.bulkPickConfigurationService.addBulkPickConfiguration(this.currentBulkPickConfiguration)
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
