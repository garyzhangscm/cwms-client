import {  formatDate } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core'; 
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInSeconds} from 'date-fns';
import { interval, Subscription } from 'rxjs';

import { UserService } from '../../auth/services/user.service';
import { ProductionLineStatus } from '../models/production-line-status';
import { ProductionShiftSchedule } from '../models/production-shift-schedule';
import { WorkOrderConfiguration } from '../models/work-order-configuration';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';


@Component({
    selector: 'app-work-order-production-line-status-display',
    templateUrl: './production-line-status-display.component.html',
    styleUrls: ['./production-line-status-display.component.less'],
    standalone: false
})
export class WorkOrderProductionLineStatusDisplayComponent implements OnInit, OnDestroy {
 
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
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
  listOfDisplayProductionLineStatus: ProductionLineStatus[] = []; 

  workOrderConfiguration?: WorkOrderConfiguration
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

  // configuration of how to display the result
  countPerPage = 1;
  totalPages = 0;
  currentPage = 1;
  columnCount = 1;
  displayColSpan = 10;
 
  // default to show 5 seconds per page
  refreshCountCycle = 5;
  countDownNumber = this.refreshCountCycle;
  showConfiguration = false;

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
 
  displayOnly = false;
  constructor(private http: _HttpClient,  
    private productionLineService: ProductionLineService, 
    private userService: UserService,
    private workOrderConfigurationService: WorkOrderConfigurationService,
    ) { 
    
      userService.isCurrentPageDisplayOnly("/work-order/production-line-status/display").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                            
    this.gridStyle = {
      width: `${(100 / this.columnCount)}%`,
      textAlign: 'center'
    }; 


  }

  ngOnInit(): void { 
    // Object.assign(this, { single: this.single });
    this.workOrderConfigurationService.getWorkOrderConfiguration().subscribe(
      {
        next: (configuration) => 
          {
            if (configuration) {   
                this.workOrderConfiguration = configuration; 
                this.refresh();
                this.countDownsubscription = interval(1000).subscribe(x => {
                  this.handleCountDownEvent();
                })
                  
            }
          }
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
      // show next page when the count down is done
      this.nextPage();
    } 

  }
  nextPage() {
    // if we haven't setup yet
    // or we are at the last page, then refresh the whole dataset
    if (this.totalPages == 0 || this.currentPage >= this.totalPages) {

      this.refresh();
    }
    else {
      // go to next page
      this.currentPage++;
      // console.log(`current page: ${this.currentPage}`);
      this.setupDisplayProductionLineStatus();
    }
  }
  setupDisplayProductionLineStatus() {
    // get the production lines that to be displayed in the current page

    let startIndex = (this.currentPage - 1) * this.countPerPage;
    let endIndex = this.currentPage * this.countPerPage - 1;
    
    // console.log(`show items: ${startIndex}, ${endIndex}`);
    this.listOfDisplayProductionLineStatus = this.listOfProductionLineStatus.slice(startIndex, endIndex + 1);
    // console.log(`this.listOfDisplayProductionLineStatus: ${this.listOfDisplayProductionLineStatus.length}`);

    // setup the length and width of each pie based on the page's configuration
    this.listOfDisplayProductionLineStatus.forEach(
      displayProductionLineStatus => {
        this.setupPieDisplay(displayProductionLineStatus.productionLine.id!);
      }
    )

  }
  resetCountDownNumber() {
    this.countDownNumber = this.refreshCountCycle;
  }
  
  ngOnDestroy() {
    this.countDownsubscription.unsubscribe();

  }

  configurationChanged() {
    // refresh the display when the configuration is changed
    // setup the rows and columns
    this.gridStyle = {
      width: `${(100 / this.columnCount)}%`,
      textAlign: 'center'
    }; 

    this.displayColSpan = 10 + (this.columnCount - 1) * 12;
    
    this.totalPages = this.listOfProductionLineStatus.length / this.countPerPage; 
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    console.log(`total pages : ${this.totalPages}, current page: ${this.currentPage }`);
    // setup pages
    this.setupDisplayProductionLineStatus();
  }
  
  setupCurrentShiftTime(): void {
    // the shift schedule has the time only, let's check if current time is within certain 
    // shift
    this.workOrderConfiguration?.productionShiftSchedules.forEach(
      productionShiftSchedule => this.setupCurrentShift(productionShiftSchedule)
    )
  }
  // discover which shift we are in so we can get the right data to display
  setupCurrentShift(productionShiftSchedule : ProductionShiftSchedule): void {
    var now = new Date(); 
    var today = formatDate(now, "YYYY-MM-dd", "en-US");

    // console.log(`check if we are in the shift ${productionShiftSchedule.shiftStartTime} ~ ${productionShiftSchedule.shiftEndTime}, shift end next day? ${productionShiftSchedule.shiftEndNextDay}`);
    if (productionShiftSchedule.shiftEndNextDay) {
      var tomorrow = formatDate(new Date().setDate(now.getDate() + 1), "YYYY-MM-dd", "en-US");
      // ok the shift end in next day, then we will check if current time is within
      // the start end and the end time of next day
      var shiftStart =   new Date(`${today} ${productionShiftSchedule.shiftStartTime}`);
      var shiftEnd =   new Date(`${tomorrow} ${productionShiftSchedule.shiftEndTime}`);
      // console.log(`1. check shift with date, [${shiftStart}, ${shiftEnd}]`);
      //differenceInSeconds return the first time - second time in seconds
      if (differenceInSeconds(now, shiftStart) >= 0 && differenceInSeconds(now, shiftEnd) <= 0) { 

        this.currentShiftStartTime = shiftStart;
        this.currentShiftEndTime = shiftEnd;
        // console.log(`1. current shift is set to, [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
      }
      else {
        // the shift may start from yesterday while we are still in the shift 
        var yesterday = formatDate(new Date().setDate(now.getDate() - 1), "YYYY-MM-dd", "en-US");
        
        shiftStart =   new Date(`${yesterday} ${productionShiftSchedule.shiftStartTime}`);
        shiftEnd =   new Date(`${today} ${productionShiftSchedule.shiftEndTime}`);
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

  // get the latest data
  refresh() : void{
    
    this.setupCurrentShiftTime();
    if (this.currentShiftStartTime != null) {

      this.search(this.currentShiftStartTime!, new Date());
    }  
  }
  
  search(startTime: Date, endTime: Date): void {
    this.isSpinning = true; 
    this.loadingData = true;
       

    // get the production line status
    this.productionLineService.getProductionLineStatus( 
      undefined,
      startTime, endTime,  ).subscribe({

        next: (productionLineStatusRes) => {
            this.listOfProductionLineStatus = productionLineStatusRes;
            this.isSpinning = false; 
            // setup the default value for all the details
            this.listOfProductionLineStatus.forEach(
              productionLineStatus => {

                this.mapOfGraphs[productionLineStatus.productionLine.id!] = {};       
                this.mapOfItems[productionLineStatus.productionLine.id!] = "";
                this.mapOfCapacities[productionLineStatus.productionLine.id!] = 0;
                this.mapOfStaffCount[productionLineStatus.productionLine.id!] = "";
                this.mapOfItemScanned[productionLineStatus.productionLine.id!] = 0;
              }
            )
            // load the details
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

  // get the capacity(goal) and item scanned(actual produced quantity)
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

                    // setup the pie display 
                    this.setupPieDisplay(productionLineCapacityAttribute.productionLine.id!);
                  
                    
                  }
                );

                // display the first page after we refresh and load everything
                this.totalPages = productionLineTotalProcedInventoryAttributeRes.length / this.countPerPage; 
                console.log(`total pages : ${this.totalPages}, this.displayColSpan: ${this.displayColSpan}`);
                this.currentPage = 1;
                this.setupDisplayProductionLineStatus();
                
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

  setupPieDisplay(productionLineId : number) {

    let completeRate = this.mapOfItemScanned[productionLineId] /
            this.mapOfCapacities[productionLineId];
    let openQuantity = this.mapOfCapacities[productionLineId] - 
            this.mapOfItemScanned[productionLineId];
    if (openQuantity < 0) {
      openQuantity = 0;
    }

    // setup the pie's size based on how many columns 
    // we would like to display in one row

    let length = 600 - 60 * (this.columnCount);

    // if complete rate is more than 90%, then 
    // show the pie as green
    // otherwise, show the pie as red
    let colors = ['#F7F9F9', '#FF0000'];
    if (completeRate > 0.9)
    {
      colors = ['#F7F9F9', '#00FF00'];
    }
 
    // setup the data and layout for each pie
    this.mapOfGraphs[productionLineId] = {

        data: [ 
          { 
            values: [
              openQuantity, 
              this.mapOfItemScanned[productionLineId]
            ],
            labels:[ 'Open', 'Completed'] ,
            type: 'pie', 
            textinfo: 'label+percent', 
            insidetextorientation: 'radial',
            insidetextfont: {size: 18},
            marker: {
              // colors: ['#D0D3D4', '#00FF00']
              colors: colors
            },
          },
        ],
        layout: {
          width: length, height: length,   
          showlegend: false,  
        },
    }; 
  }

  
}
