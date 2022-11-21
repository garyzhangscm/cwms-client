import {  formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core'; 
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';
import { PlotlyModule } from 'angular-plotly.js';
import { differenceInSeconds} from 'date-fns';
import * as PlotlyJS from 'plotly.js-dist-min';
import { interval, Subscription } from 'rxjs';

import { ProductionLineStatus } from '../models/production-line-status';
import { ProductionShiftSchedule } from '../models/production-shift-schedule';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';


@Component({
  selector: 'app-work-order-production-line-status-display',
  templateUrl: './production-line-status-display.component.html',
  styleUrls: ['./production-line-status-display.component.less'],
})
export class WorkOrderProductionLineStatusDisplayComponent implements OnInit {
 
  public graph = {
    data: [ 
        { values: [90, 20],
          labels:[ 'open', 'completed'] ,
          type: 'pie', 
          textinfo: 'label+percent', 
          insidetextorientation: 'radial',
          insidetextfont: {size: 18},
          marker: {
            colors: ['#808080', '#00FF00']
          },
        },
    ],
    layout: {
      width: 400, height: 400,   
      showlegend: false
    }
  };

  listOfProductionLineStatus: ProductionLineStatus[] = []; 
  
  refreshCountCycle = 10;
  countDownNumber = this.refreshCountCycle;

  isSpinning = false;

  currentShiftStartTime? : Date;
  currentShiftEndTime? : Date;
  countDownsubscription!: Subscription;
  loadingData = false;

  
  mapOfItems: { [key: number]: string } = {};
  mapOfCapacities: { [key: number]: number } = {};
  mapOfStaffCount: { [key: number]: string } = {};
  mapOfItemScanned: { [key: number]: number } = {};
  // display pie for each production line
  // mapOfResults: { [key: number]: any[] } = {};
  mapOfGraphs: { [key: number]: any } = {};
  
  gridStyle = {
    width: '33%',
    textAlign: 'center'
  }; 
 
  /***

  single: any[] = [
    {
      "name": "Copmlete",
      "value": 111
    },
    {
      "name": "Open",
      "value": -11
    }, 
  ];

   * Configuration for ngx-charts-pie-chart
   * 
  view: [number, number] = [700, 400];


  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = false;
  isDoughnut: boolean = false;
  legendPosition: LegendPosition = LegendPosition.Below;

  greenColorScheme = {
    domain: ['#00FF00', '#808080	']
  };  
 
  redColorScheme = {
    domain: ['#FF0000	', '#808080	']
  };
  
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  
  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

   */
 
  constructor(private http: _HttpClient, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private productionLineService: ProductionLineService, 
    private workOrderConfigurationService: WorkOrderConfigurationService,
    ) { 
    

  }

  ngOnInit(): void { 
    // Object.assign(this, { single: this.single });
    this.workOrderConfigurationService.getWorkOrderConfiguration().subscribe(
      {
        next: (configuration) => 
          {
            if (configuration) {    
                this.setupCurrentShiftTime(configuration.productionShiftSchedules);
                this.refresh();
                this.countDownsubscription = interval(1000).subscribe(x => {
                  this.handleCountDownEvent();
                })
                  
            }
          }
      });
 
  }
  
  handleCountDownEvent(): void {
    return;

    // don't count down when we are loading data
    if (this.loadingData) {
      
      this.resetCountDownNumber();
      return;
    }
    this.countDownNumber--;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();
      this.refresh();
    }
  }
  resetCountDownNumber() {
    this.countDownNumber = this.refreshCountCycle;
  }
  
  ngOnDestroy() {
    this.countDownsubscription.unsubscribe();

  }

  
  setupCurrentShiftTime(productionShiftSchedules : ProductionShiftSchedule[]): void {
    // the shift schedule has the time only, let's check if current time is within certain 
    // shift
    productionShiftSchedules.forEach(
      productionShiftSchedule => this.setupCurrentShift(productionShiftSchedule)
    )
  }
  setupCurrentShift(productionShiftSchedule : ProductionShiftSchedule): void {
    var now = new Date(); 
    var today = formatDate(now, "YYYY-MM-dd", "en-US");

    // console.log(`check if we are in the shift ${productionShiftSchedule.shiftStartTime} ~ ${productionShiftSchedule.shiftEndTime}, shift end next day? ${productionShiftSchedule.shiftEndNextDay}`);
    if (productionShiftSchedule.shiftEndNextDay) {
      var tomorrow = formatDate(now.setDate(now.getDate() + 1), "YYYY-MM-dd", "en-US");
      // ok the shift end in next day, then we will check if current time is within
      // the start end and the end time of next day
      var shiftStart =   new Date(`${today} ${productionShiftSchedule.shiftStartTime}`);
      var shiftEnd =   new Date(`${tomorrow} ${productionShiftSchedule.shiftStartTime}`);
      // console.log(`1. check shift with date, [${shiftStart}, ${shiftEnd}]`);
      //differenceInSeconds return the first time - second time in seconds
      if (differenceInSeconds(now, shiftStart) >= 0 && differenceInSeconds(now, shiftEnd) <= 0) { 

        this.currentShiftStartTime = shiftStart;
        this.currentShiftEndTime = shiftEnd;
        // console.log(`1. current shift is set to, [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
      }
      else {
        // the shift may start from yesterday while we are still in the shift
        var now = new Date(); 
        var yesterday = formatDate(now.setDate(now.getDate() - 1), "YYYY-MM-dd", "en-US");
        
        shiftStart =   new Date(`${yesterday} ${productionShiftSchedule.shiftStartTime}`);
        shiftEnd =   new Date(`${today} ${productionShiftSchedule.shiftStartTime}`);
        // console.log(`2. get shift with date [${shiftStart}, ${shiftEnd}]`);
        if (differenceInSeconds(now, shiftStart) >= 0 && differenceInSeconds(now, shiftEnd) <= 0) { 
          this.currentShiftStartTime = shiftStart;
          this.currentShiftEndTime = shiftEnd;
          // console.log(`1. current shift is set to, [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
        }
      }
    }
    else {
      // shift start and end in the same day
      // console.log(`3. will setup start time by ${today} ${productionShiftSchedule.shiftStartTime}`)
      var shiftStart =   new Date(`${today} ${productionShiftSchedule.shiftStartTime}`);
      // console.log(`3. will setup start time by ${today} ${productionShiftSchedule.shiftEndTime}`)
      var shiftEnd =   new Date(`${today} ${productionShiftSchedule.shiftEndTime}`);
      // console.log(`3. get shift with date [${shiftStart}, ${shiftEnd}]`);
      //differenceInSeconds return the first time - second time in seconds
      if (differenceInSeconds(now, shiftStart) >= 0 && differenceInSeconds(now, shiftEnd) <= 0) { 
        this.currentShiftStartTime = shiftStart;
        this.currentShiftEndTime = shiftEnd;
       // console.log(`1. current shift is set to, [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
      }
    }
  
  }

  
  refresh() : void{
    
    if (this.currentShiftStartTime != null) {

      this.search(this.currentShiftStartTime!, new Date());
    }  
  }
  
  search(startTime: Date, endTime: Date): void {
    this.isSpinning = true; 
    this.loadingData = true;
       

    this.productionLineService.getProductionLineStatus( 
      undefined,
      startTime, endTime,  ).subscribe({

        next: (productionLineStatusRes) => {
            this.listOfProductionLineStatus = productionLineStatusRes;
            this.isSpinning = false; 
            this.listOfProductionLineStatus.forEach(
              productionLineStatus => {

                this.mapOfGraphs[productionLineStatus.productionLine.id!] = {};       
                this.mapOfItems[productionLineStatus.productionLine.id!] = "";
                this.mapOfCapacities[productionLineStatus.productionLine.id!] = 0;
                this.mapOfStaffCount[productionLineStatus.productionLine.id!] = "";
                this.mapOfItemScanned[productionLineStatus.productionLine.id!] = 0;
              }
            )
            this.loadDetailInformation(startTime, endTime);
            this.loadingData = false;       
        
        },
        error: () => { 
            this.isSpinning = false; 
        }


    }); 
  }

  
  loadDetailInformation(startTime: Date, endTime: Date) {
    // load the item information
    this.loadItemInformation();
    // this.loadCapacityInformation();
    // this.loadStaffCountInformation();
    // this.loadProducedInventoryInformation(startTime, endTime);
    this.setupDisplay(startTime, endTime);
    
  }
  loadItemInformation() {
    this.productionLineService.getProductionLineItemAttributes().subscribe(
      {
        next: (productionLineAttributeRes) => {

          productionLineAttributeRes.forEach(
            productionLineAttribute => {
              this.mapOfItems[productionLineAttribute.productionLine.id!] = productionLineAttribute.value
            }
          )
        }
      }
    );
  }  

  setupDisplay(startTime: Date, endTime: Date) {
    
    this.isSpinning = true; 
    this.productionLineService.getProductionLineCapacityAttributes().subscribe(
      {
        next: (productionLineCapacityAttributeRes) => {

          this.productionLineService.getProductionLineTotalProcedInventoryQuantity(
            undefined, startTime, endTime
          ).subscribe(
            {
              next: (productionLineTotalProcedInventoryAttributeRes) => {
      
                productionLineTotalProcedInventoryAttributeRes.forEach(
                  productionLineTotalProcedInventoryAttribute => {
                    this.mapOfItemScanned[productionLineTotalProcedInventoryAttribute.productionLine.id!] = +productionLineTotalProcedInventoryAttribute.value;
                                        
                  }
                );
                
                productionLineCapacityAttributeRes.forEach(
                  productionLineCapacityAttribute => {
                    this.mapOfCapacities[productionLineCapacityAttribute.productionLine.id!] = +productionLineCapacityAttribute.value;

                    // console.log(`production line id: ${productionLineCapacityAttribute.productionLine.id!}`);
                    // console.log(`> Copmlete: ${this.mapOfItemScanned[productionLineCapacityAttribute.productionLine.id!]}`);
                    // console.log(`> capacity: ${this.mapOfCapacities[productionLineCapacityAttribute.productionLine.id!]}`);
                    /**
                     * 
                     * 
                    this.mapOfResults[productionLineCapacityAttribute.productionLine.id!] =
                    [
                      {
                        "name": "Copmlete",
                        "value": this.mapOfItemScanned[productionLineCapacityAttribute.productionLine.id!]
                      },
                      {
                        "name": "Open",
                        "value": this.mapOfCapacities[productionLineCapacityAttribute.productionLine.id!] - 
                                this.mapOfItemScanned[productionLineCapacityAttribute.productionLine.id!]
                      },
                    ];    
                     */
                    // if 90% complete, show green, else show red
                    let completeRate = this.mapOfItemScanned[productionLineCapacityAttribute.productionLine.id!] /
                                           this.mapOfCapacities[productionLineCapacityAttribute.productionLine.id!];
                    let openQuantity = this.mapOfCapacities[productionLineCapacityAttribute.productionLine.id!] - 
                          this.mapOfItemScanned[productionLineCapacityAttribute.productionLine.id!];
                    if (openQuantity < 0) {
                      openQuantity = 0;
                    }
                    // console.log(`${productionLineCapacityAttribute.productionLine.name} complete rate: ${completeRate}`);
                    if (completeRate > 0.9)
                    {
                      this.mapOfGraphs[productionLineCapacityAttribute.productionLine.id!] = {

                          data: [ 
                            { values: [
                                  openQuantity
                                  , 
                                  this.mapOfItemScanned[productionLineCapacityAttribute.productionLine.id!]],
                              labels:[ 'Open', 'Completed'] ,
                              type: 'pie', 
                              textinfo: 'label+percent', 
                              insidetextorientation: 'radial',
                              insidetextfont: {size: 18},
                              marker: {
                                colors: ['#808080', '#00FF00']
                              },
                            },
                        ],
                        layout: {
                          width: 400, height: 400,   
                          showlegend: false
                        }
                      }
                    }
                    else {
                      this.mapOfGraphs[productionLineCapacityAttribute.productionLine.id!] = {

                        data: [ 
                          { values: [
                                openQuantity
                                , 
                                this.mapOfItemScanned[productionLineCapacityAttribute.productionLine.id!]],
                            labels:[ 'Open', 'Completed'] ,
                            type: 'pie', 
                            textinfo: 'label+percent', 
                            insidetextorientation: 'radial',
                            insidetextfont: {size: 18},
                            marker: {
                              colors: ['#808080', '#FF0000']
                            },
                          },
                        ],
                        layout: {
                          width: 400, height: 400,   
                          showlegend: false
                        }
                      }

                    }
                  
                    
                  }
                );
                
                this.isSpinning = false; 
              }, 
              error: () => this.isSpinning = false
            }
          );
        }, 
        error: () => this.isSpinning = false
      }
    );
  }

  
}
