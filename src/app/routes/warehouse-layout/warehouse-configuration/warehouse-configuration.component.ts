import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { UserService } from '../../auth/services/user.service'; 
import { ArchiveConfiguration } from '../models/archive-configuration';
import { PrintingStrategy } from '../models/printing-strategy.enum';
import { WarehouseConfiguration } from '../models/warehouse-configuration';
import { WarehouseHoliday } from '../models/warehouse-holiday'; 
import { ArchiveConfigurationService } from '../services/archive-configuration.service';
import { WarehouseConfigurationService } from '../services/warehouse-configuration.service';
import { WarehouseHolidayService } from '../services/warehouse-holiday.service';
import { WarehouseService } from '../services/warehouse.service';

@Component({
    selector: 'app-warehouse-layout-warehouse-configuration',
    templateUrl: './warehouse-configuration.component.html',
    styleUrls: ['./warehouse-configuration.component.less'],
    standalone: false
})
export class WarehouseLayoutWarehouseConfigurationComponent implements OnInit {

  isSpinning = false;
  isArchiveSpinning = false;
  currentWarehouseConfiguration: WarehouseConfiguration;
  currentArchiveConfiguration: ArchiveConfiguration;
  
  printingStrategyList = PrintingStrategy;

  holidayYearIndex = 0;
  holidayYears: string[] = [];
  holidays: WarehouseHoliday[][] = [];
  avaiableZoneIds : string[] = [];
   
  addHolidayForm!: UntypedFormGroup;

  displayOnly = false;
  constructor(
    
    private warehouseService: WarehouseService,
    private messageService: NzMessageService, 
    private warehouseHolidayService: WarehouseHolidayService,
    private archiveConfigurationService: ArchiveConfigurationService,
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private userService: UserService,
    private warehouseConfigurationService: WarehouseConfigurationService) {
      
      userService.isCurrentPageDisplayOnly("/warehouse-layout/warehouse-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                               

      this.currentWarehouseConfiguration = {        
        warehouse: this.warehouseService.getCurrentWarehouse(),
        threePartyLogisticsFlag: false,
        listPickEnabledFlag: false,
        newLPNPrintLabelAtReceivingFlag: false,
        newLPNPrintLabelAtProducingFlag: false,
        newLPNPrintLabelAtAdjustmentFlag: false,
        
        reuseLPNAfterRemovedFlag: false,
        reuseLPNAfterShippedFlag: false,
        billingRequestEnabledFlag: false,
        workingOnSundayFlag: false,
        workingOnMondayFlag: false,
        workingOnTuesdayFlag: false,
        workingOnWednesdayFlag: false,
        workingOnThursdayFlag: false,
        workingOnFridayFlag: false,
        workingOnSaturdayFlag: false,

        
        // locationUtilizationSnapshotEnabled: false,
        // inventoryAgingSnapshotEnabled: false,
      }
      this.currentArchiveConfiguration = {
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        inventoryArchiveEnabled: false,
        removedInventoryArchiveDays: 0
      }
  }

  ngOnInit(): void { 
    this.addHolidayForm =  this.fb.group({
      date: [null],
      description: [null], 

    });

    this.isSpinning = true;
    this.warehouseService.getAvailableZoneIds().subscribe({
      next: (zoneIds) => this.avaiableZoneIds = zoneIds
    });
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
          
          this.setupHolidayDisplay();
          
        }, 
        error: () => this.isSpinning = false
      }
    );

    
    this.isArchiveSpinning = true;
    this.archiveConfigurationService.getArchiveConfiguration().subscribe(
      {
        next: (configRes) => {
          // we should only get one configuration since
          // we are only allowed to get the configuratoin for current warehouse
          if (configRes) {
            // if we already have the configuration setup for the current warehouse
            // load it. otherwise, load the default one
            
            this.currentArchiveConfiguration = configRes;
          }

          this.isArchiveSpinning = false; 
          
        }, 
        error: () => this.isArchiveSpinning = false
      }
    )

  }

  // display the warehouse holiday in previous year, 
  // current year and next year
  setupHolidayDisplay() {
    var today = new Date();
    this.holidayYears = [
      `${today.getFullYear() - 1}`,
      `${today.getFullYear()}`,
      `${today.getFullYear() + 1}`
    ];
    // show this year's holiday by default
    this.holidayYearIndex = 1;
    console.log(`start to show holiday year with ${JSON.stringify(this.holidayYears)}`);

    this.loadHolidayInformation(0);
    // we will only show the date for the selected tab

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

  confirmArchiveConfiguration() {
    this.isArchiveSpinning = true;
    
    this.archiveConfigurationService.addArchiveConfiguration(this.currentArchiveConfiguration)
    .subscribe({
      next:() => {
        
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        this.isArchiveSpinning = false;
      }, 
      error: () => this.isArchiveSpinning = false
    })
  }

  loadHolidayInformation(index: number) {
    this.isSpinning = true;
    if (index >= this.holidayYears.length) {
      // end of the recursive call
      this.isSpinning = false;
      return;
    }
    this.warehouseHolidayService.getWarehouseHolidaysByYear(this.holidayYears[index]).subscribe({

      next: (holidaysRes) => {
        this.holidays[index] = [...holidaysRes];
        this.loadHolidayInformation(index + 1);
      }, 
      error: () => this.isSpinning = false
    })

  }

  removeHoliday(holiday: WarehouseHoliday) {

    this.isSpinning = true;
    this.warehouseHolidayService.removeWarehouseHoliday(holiday.id!).subscribe({
      next: () => {
        this.isSpinning = false;
        this.loadHolidayInformation(0);
      },
      error: () => this.isSpinning = false
      
    })
  }

  addHoliday() {
    // make sure the user choose a date and type in the description
    
    const holidayDate : Date = this.addHolidayForm.controls.date.value;
    const description : string = this.addHolidayForm.controls.description.value;
    console.log(`start to add holiday with date ${holidayDate} and description: ${description}`);
    if (holidayDate == null) {
      console.log(`holidayDate is null`);
      this.messageService.error(this.i18n.fanyi("select-a-date-to-add-as-holiday"));
      return;

    } 
    if (description == null || description.trim().length == 0) {
      this.messageService.error(this.i18n.fanyi("type-in-description-for-holiday"));
      return;

    }
    const holiday : WarehouseHoliday = {
      
      warehouse: this.warehouseService.getCurrentWarehouse(),
  
      holidayDate: holidayDate,
      description: description,
    }
    this.isSpinning = true;
    this.warehouseHolidayService.addWarehouseHoliday(holiday).subscribe({
      next: () => {
        this.isSpinning = false;
        
        this.addHolidayForm.reset();
        this.loadHolidayInformation(0);
      },
      error: () => this.isSpinning = false
      
    })
  }
}
