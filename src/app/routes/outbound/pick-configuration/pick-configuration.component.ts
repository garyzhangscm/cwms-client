import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { SortDirection } from '../../util/models/sort-direction';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BulkPickConfiguration } from '../models/bulk-pick-configuration';
import { PickConfiguration } from '../models/pick-configuration';
import { BulkPickConfigurationService } from '../services/bulk-pick-configuration.service';
import { PickConfigurationService } from '../services/pick-configuration.service';

@Component({
    selector: 'app-outbound-pick-configuration',
    templateUrl: './pick-configuration.component.html',
    standalone: false
})
export class OutboundPickConfigurationComponent implements OnInit {
  currentBulkPickConfiguration!: BulkPickConfiguration;
  currentPickConfiguration!: PickConfiguration;
  sortDirections = SortDirection;

  isPickConfigurationSpinning = false;
  isBulkPickConfigurationSpinning = false;
  displayOnly = false;

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private messageService: NzMessageService, 
    private bulkPickConfigurationService: BulkPickConfigurationService,
    private pickConfigurationService: PickConfigurationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,    
    private userService: UserService, ) { 
      
      userService.isCurrentPageDisplayOnly("/outbound/pick-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );      

      this.currentBulkPickConfiguration = {

        warehouseId: warehouseService.getCurrentWarehouse().id,
        enabledForOutbound: false,
        enabledForWorkOrder: false,
        pickSortDirection: SortDirection.ASC,
        releaseToWorkTask: false,
        workTaskPriority: 9999,
      }
      this.currentPickConfiguration = {

        warehouseId: warehouseService.getCurrentWarehouse().id, 
        releaseToWorkTask: false,
        workTaskPriority: 99,
        releasePickListToWorkTask: false,
        pickListWorkTaskPriority: 99,
      }
  }

  ngOnInit(): void { 
  
    this.isPickConfigurationSpinning = true;
    this.pickConfigurationService.getPickConfiguration().subscribe(
      {
        next: (pickConfigurationRes) => {
          if (pickConfigurationRes != null) {
            this.currentPickConfiguration = pickConfigurationRes;
          }
          this.isPickConfigurationSpinning = false;
        }, 
        error: () => this.isPickConfigurationSpinning = false
      }
    );

    
    this.isBulkPickConfigurationSpinning = true;
    this.bulkPickConfigurationService.getBulkPickConfiguration().subscribe(
      {
        next: (bulkPickConfigurationRes) => {
          if (bulkPickConfigurationRes != null) {
            this.currentBulkPickConfiguration = bulkPickConfigurationRes;
          }
          this.isBulkPickConfigurationSpinning = false;
        }, 
        error: () => this.isBulkPickConfigurationSpinning = false
      }
    );
  }

  
  pickSortDirectionChanged(sortDirection: SortDirection) : void { 
    this.currentBulkPickConfiguration.pickSortDirection = sortDirection;
  }

  confirmBulkPickConfiguration() {
    this.isBulkPickConfigurationSpinning = true;
    if (this.currentBulkPickConfiguration.id != null) {
      this.bulkPickConfigurationService.changeBulkPickConfiguration(this.currentBulkPickConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isBulkPickConfigurationSpinning = false;
        },
        error: () => this.isBulkPickConfigurationSpinning = false
      });
    }
    else {
      this.bulkPickConfigurationService.addBulkPickConfiguration(this.currentBulkPickConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isBulkPickConfigurationSpinning = false;
        },
        error: () => this.isBulkPickConfigurationSpinning = false
      });

    }
  }
  
  confirmPickConfiguration() {
    this.isPickConfigurationSpinning = true;
    if (this.currentPickConfiguration.id != null) {
      this.pickConfigurationService.changePickConfiguration(this.currentPickConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isPickConfigurationSpinning = false;
        },
        error: () => this.isPickConfigurationSpinning = false
      });
    }
    else {
      this.pickConfigurationService.addPickConfiguration(this.currentPickConfiguration)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isPickConfigurationSpinning = false;
        },
        error: () => this.isPickConfigurationSpinning = false
      });

    }
  }
}
