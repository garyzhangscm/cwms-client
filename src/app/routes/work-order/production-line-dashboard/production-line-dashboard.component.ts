import {  formatDate } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {  UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { differenceInSeconds} from 'date-fns';
import { Subscription, interval } from 'rxjs';

import { ProductionLineStatus } from '../models/production-line-status';
import { ProductionShiftSchedule } from '../models/production-shift-schedule';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';

@Component({
  selector: 'app-work-order-production-line-dashboard',
  templateUrl: './production-line-dashboard.component.html',
  styleUrls: ['./production-line-dashboard.component.less'],
})
export class WorkOrderProductionLineDashboardComponent implements OnInit , OnDestroy{ 
  listOfProductionLineStatus: ProductionLineStatus[] = []; 
  
  refreshCountCycle = 10;
  countDownNumber = this.refreshCountCycle;

  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("production-line"),  index: 'productionLine.name'   }, 
    {
      title: this.i18n.fanyi("item"),  
      render: 'itemColumn', 
    },
    {
      title: this.i18n.fanyi("status"),  
      render: 'statusColumn', 
    },
    {
      title: this.i18n.fanyi("averageCycleTime"),  
      render: 'averageCycleTimeColumn', 
    }, 
    {
      title: this.i18n.fanyi("moldCount"),  
      render: 'moldCountColumn', 
    },
    {
      title: this.i18n.fanyi("itemScanned"),  
      render: 'itemScannedColumn', 
    },
    {
      title: this.i18n.fanyi("difference"),  
      render: 'differenceColumn', 
    },
    {
      title: this.i18n.fanyi("laborNeed"),  
      render: 'laborNeedColumn', 
    },
    {
      title: this.i18n.fanyi("goalQuantity"),  
      render: 'capacityColumn', 
    },
    {
      title: this.i18n.fanyi("achievingRate"),  
      render: 'achievingRateColumn', 
    },
  ]; 

  // key: productionLineId
  // value: lazy loaded information
  mapOfItems: { [key: number]: string } = {};
  mapOfCapacities: { [key: number]: number } = {};
  mapOfStaffCount: { [key: number]: string } = {};
  mapOfItemScanned: { [key: number]: number } = {};

  currentShiftStartTime? : Date;
  currentShiftEndTime? : Date;


  countDownsubscription!: Subscription;
  loadingData = false;
  
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private productionLineService: ProductionLineService, 
    private workOrderConfigurationService: WorkOrderConfigurationService,
    private titleService: TitleService,  ) { }

  ngOnInit(): void {
      this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.production-line-dashboard')); 
      
      // load the production shift schedule so we will only calculate the 
      // KPI for current shift
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
      var tomorrow = formatDate(new Date().setDate(now.getDate() + 1), "YYYY-MM-dd", "en-US");
      // ok the shift end in next day, then we will check if current time is within
      // the start end and the end time of next day
      var shiftStart =   new Date(`${today} ${productionShiftSchedule.shiftStartTime}`);
      var shiftEnd =   new Date(`${tomorrow} ${productionShiftSchedule.shiftEndTime}`);
      // console.log(`1. check shift with date, [${shiftStart}, ${shiftEnd}]`);
      // console.log(`1.1. differenceInSeconds(now, shiftStart): ${differenceInSeconds(now, shiftStart)}`);
      // console.log(`1.2. differenceInSeconds(now, shiftEnd): ${differenceInSeconds(now, shiftEnd)}`);
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
        // console.log(`2.1. differenceInSeconds(now, shiftStart): ${differenceInSeconds(now, shiftStart)}`);
        // console.log(`2.2. differenceInSeconds(now, shiftEnd): ${differenceInSeconds(now, shiftEnd)}`);
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
      
      // console.log(`3. get shift with date [${shiftStart}, ${shiftEnd}]`);
      // console.log(`3.1. differenceInSeconds(now, shiftStart): ${differenceInSeconds(now, shiftStart)}`);
      // console.log(`3.2. differenceInSeconds(now, shiftEnd): ${differenceInSeconds(now, shiftEnd)}`);
      //differenceInSeconds return the first time - second time in seconds
      if (differenceInSeconds(now, shiftStart) >= 0 && differenceInSeconds(now, shiftEnd) <= 0) { 
        this.currentShiftStartTime = shiftStart;
        this.currentShiftEndTime = shiftEnd;
       // console.log(`1. current shift is set to, [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
      }
    }
  
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
      this.refresh();
    }
  }
  resetCountDownNumber() {
    this.countDownNumber = this.refreshCountCycle;
  }
  
  ngOnDestroy() {
    this.countDownsubscription.unsubscribe();

  }

  refresh() : void{
    /***
     * 
     * 
    let currentDateTime = new Date(); 
    let shiftStart =  formatDate(currentDateTime, "YYYY-MM-dd", this.i18n.defaultLang)
    // shiftStart = `${shiftStart}T16:00:00.000Z`;
    shiftStart = `${shiftStart}T16:00:00`;
    // console.log(`shiftStart ${shiftStart}`);
    let shiftStartDateTime = new Date(shiftStart); 
    if (currentDateTime.getHours() < 16) {
      // we are before today's shift start time, then 
      // we should calculate the performance from yesterday's 4PM
      shiftStartDateTime.setDate(shiftStartDateTime.getDate() - 1);

    }
    shiftStartDateTime.setDate(shiftStartDateTime.getDate() - 10);

     * 
     */
    // console.log(`shiftStartDateTime: ${JSON.stringify(shiftStartDateTime)}`);
    
      // console.log(`shiftStart: ${JSON.stringify(new Date(shiftStart))}`);
      
      // console.log(`current date time ${JSON.stringify(currentDateTime)}`);
      // console.log(`shiftStart ${shiftStart}`);
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
    this.loadCapacityInformation();
    this.loadStaffCountInformation();
    this.loadProducedInventoryInformation(startTime, endTime);
    
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
  loadCapacityInformation() {
    this.productionLineService.getProductionLineCapacityAttributes().subscribe(
      {
        next: (productionLineAttributeRes) => {

          productionLineAttributeRes.forEach(
            productionLineAttribute => {
              this.mapOfCapacities[productionLineAttribute.productionLine.id!] = +productionLineAttribute.value
            }
          )
        }
      }
    );
  }
  loadStaffCountInformation() {
    this.productionLineService.getProductionLineStaffCountAttributes().subscribe(
      {
        next: (productionLineAttributeRes) => {

          productionLineAttributeRes.forEach(
            productionLineAttribute => {
              this.mapOfStaffCount[productionLineAttribute.productionLine.id!] = productionLineAttribute.value
            }
          )
        }
      }
    );
  }

  loadProducedInventoryInformation(startTime: Date, endTime: Date) {
    this.productionLineService.getProductionLineTotalProcedInventoryQuantity(
      undefined, startTime, endTime
    ).subscribe(
      {
        next: (productionLineAttributeRes) => {

          productionLineAttributeRes.forEach(
            productionLineAttribute => {
              this.mapOfItemScanned[productionLineAttribute.productionLine.id!] = +productionLineAttribute.value
            }
          )
        }
      }
    );
    /**
     * 
     * 
    this.productionLineService.getProductionLineCapacityAttributes().subscribe(
      {
        next: (productionLineAttributeRes) => {

          productionLineAttributeRes.forEach(
            productionLineAttribute => {
              console.log(`start to get produced inventory information for production line ${productionLineAttribute.productionLine.name} `)
                this.productionLineAssignmentService.getProductionLineAssignments(productionLineAttribute.productionLine.id!)
                .subscribe({
                  next: (productionLineAssignmentsRes) => { 

                    // for each assignment, find the produce transaction with the production line and work order
                    // in the specific time span
                    productionLineAssignmentsRes.forEach(
                      productionLineAssignment => {
                        console.log(`production line ${productionLineAttribute.productionLine.name}, work order ${productionLineAssignment.workOrderNumber} `)
                        this.workOrderProduceTransactionService.getWorkOrderProduceTransaction(
                          productionLineAssignment.workOrderNumber, 
                          productionLineAttribute.productionLine.id,  
                           startTime, endTime).subscribe(
                          {
                            next: (workOrderProduceTransactionRes) => {
                              let totalProducedInventoryCount = 0;
                              workOrderProduceTransactionRes.forEach(
                                workOrderProduceTransaction => { 
                                      workOrderProduceTransaction.workOrderProducedInventories.forEach(
                                        inventory => totalProducedInventoryCount += (inventory.quantity == null ? 0 :  inventory.quantity)
                                      );
                                }
                              )
                              this.mapOfCapacities[productionLineAttribute.productionLine.id!] = totalProducedInventoryCount.toString();
                              
                            }, 
                          }
                        )
                      }
                    )
                    
                  }, 
                  error: () => this.isSpinning = false
                })
            }
          )
        }
      }
    );
     */
  }
}
