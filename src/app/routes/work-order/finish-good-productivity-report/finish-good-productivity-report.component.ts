 
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN,  _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { interval } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { ItemFamily } from '../../inventory/models/item-family';
import { ItemFamilyService } from '../../inventory/services/item-family.service';  
import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ItemProductivityReport } from '../models/item-productivity-report';
import { LightMesConfiguration } from '../models/light-mes-configuration';
import { ItemProductivityReportService } from '../services/item-productivity-report.service';
import { LightMesConfigurationService } from '../services/light-mes-configuration.service';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';


@Component({
    selector: 'app-work-order-finish-good-productivity-report',
    templateUrl: './finish-good-productivity-report.component.html',
    standalone: false
})
export class WorkOrderFinishGoodProductivityReportComponent implements OnInit, OnDestroy {  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  itemProductivityReports: ItemProductivityReport[] = [];
  itemFamilies: ItemFamily[] = [];
  selectedItemFamily = "All";
  
  itemFamilyLocalStorageKey = "finish_good_productivity_report_item_family_key";
  refreshCountCycleLocalStorageKey = "finish_good_productivity_report_refresh_cycle_key";
  
  isSpinning = false;
  
  refreshCountCycle = 120;
  countDownNumber = this.refreshCountCycle;
  countDownsubscription!: Subscription;
  loadingData = false;
  showConfiguration = false;

  // refresh and show the current time
  currentTime : string = "";
  currentTimesubscription!: Subscription;
  hoursSpentInThisShift: number = 0;

  currentShiftStartTime?: string;
  currentShiftEndTime?: string;
  shiftTimesubscription!: Subscription;
  
  lightMESConfiguration?: LightMesConfiguration;

  
  columns: STColumn[] = [

    { title: this.i18n.fanyi("item"), index: 'itemName',   },
    {
      title: this.i18n.fanyi("production-line"), 
      render: 'productionLineColumn'
    },    
    { title: this.i18n.fanyi("realTimeGoal"), index: 'realTimeGoal',  },  
    { title: this.i18n.fanyi("actualPalletQuantity"), index: 'actualPalletQuantity',  },  
    { title: this.i18n.fanyi("actualQuantity"), index: 'actualQuantity',  },  
    { title: this.i18n.fanyi("finishRate"), 
        render: 'finishRateColumn'  },  
    { title: this.i18n.fanyi("estimatedFinishRate"),  render: 'estimatedFinishRateColumn'   },    
  ];
  
  constructor(private http: _HttpClient, 
    private itemProductivityReportService: ItemProductivityReportService,  
    private itemFamilyService: ItemFamilyService,
    private messageService: NzMessageService,   
    private workOrderConfigurationService: WorkOrderConfigurationService,
    private dateTimeService: DateTimeService,
    private warehouseService: WarehouseService,
    private lightMESConfigurationService: LightMesConfigurationService) { 
       
      lightMESConfigurationService.getLightMesConfiguration().subscribe({
        next: (lightMESConfigurationRes) => this.lightMESConfiguration = lightMESConfigurationRes
      }); 
      
  }

  ngOnInit(): void { 
      this.refresh(); 
  
      this.currentTime =  this.dateTimeService.getCurrentTimeByWarehouseTimeZone().format("MM/DD/yyyy HH:mm:ss");
      // this.currentTime =  moment(new Date()).tz(this.warehouseService.getCurrentWarehouse().timeZone!);

      this.itemFamilyService.loadItemFamilies().subscribe({
        next: (itemFamilyRes) => {
          this.itemFamilies = itemFamilyRes;
        }
      })
      
      this.countDownsubscription = interval(1000).subscribe(x => {
        this.handleCountDownEvent();
      });
      this.currentTimesubscription = interval(1000).subscribe(x => { 
        this.currentTime =  this.dateTimeService.getCurrentTimeByWarehouseTimeZone().format("MM/DD/yyyy HH:mm:ss"); 
        
         //this.currentTime =  moment(new Date()).tz(this.warehouseService.getCurrentWarehouse().timeZone!);
             
      });

      this.workOrderConfigurationService.getCurrentShift().subscribe({
        next: (currentShiftRes) => { 
              
            this.currentShiftStartTime = currentShiftRes.first;
            this.currentShiftEndTime = currentShiftRes.second;
            // console.log(`current shift [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
 
 
            // get the different between now and the shift start 
            let start = this.dateTimeService.getTimeWithTimeZone(
              this.currentShiftStartTime!, 'MM/DD/YYYY HH:mm:ss', this.warehouseService.getCurrentWarehouse().timeZone!);
             
            let end = this.dateTimeService.getCurrentTimeByWarehouseTimeZone();
           
            this.hoursSpentInThisShift = end.diff(start) * 1.0 / (1000 * 60 * 60);
                 
      
            }
          }); 

      this.shiftTimesubscription = interval(60000).subscribe(x => { 
        this.workOrderConfigurationService.getCurrentShift().subscribe({
          next: (currentShiftRes) => { 
                
              this.currentShiftStartTime = currentShiftRes.first;
              this.currentShiftEndTime = currentShiftRes.second;
              

                    // get the different between now and the shift start 
              let start = this.dateTimeService.getTimeWithTimeZone(
                    this.currentShiftStartTime!, 'MM/DD/YYYY HH:mm:ss', this.warehouseService.getCurrentWarehouse().timeZone!);
                  
              let end = this.dateTimeService.getCurrentTimeByWarehouseTimeZone();
           
              this.hoursSpentInThisShift = end.diff(start) * 1.0 / (1000 * 60 * 60);
                   
        
              }
            }); 
      });


   }
 

   refresh(itemFamily?: string) {
    this.isSpinning = true;
    this.itemProductivityReportService.getItemProductivityReportForCurrentShift(undefined, itemFamily).subscribe({
      next: (itemProductivityReportRes) => { 
        this.itemProductivityReports = itemProductivityReportRes;
        
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
   } 

   handleCountDownEvent(): void {
     
    // don't count down when we are loading data
    if (this.loadingData) {
      
      this.resetCountDownNumber();
      return;
    }
    this.countDownNumber--;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();
      
      if (this.selectedItemFamily == "All") {
        this.refresh();
      }
      else {

        this.refresh(this.selectedItemFamily);
      }
    } 

  }
  resetCountDownNumber() {
    this.countDownNumber = this.refreshCountCycle;
  }
  
  ngOnDestroy() {
    this.countDownsubscription.unsubscribe();
    this.currentTimesubscription.unsubscribe();
    this.shiftTimesubscription.unsubscribe(); 
  }

  itemFamilyChanged() {
    
    localStorage.setItem(this.itemFamilyLocalStorageKey, this.selectedItemFamily)
    if (this.selectedItemFamily == "All") {
      this.refresh();
    }
    else {

      this.refresh(this.selectedItemFamily);
    }

  }

  refreshCountCycleChanged() {
    
    localStorage.setItem(this.refreshCountCycleLocalStorageKey, this.refreshCountCycle.toString());
  }


}
