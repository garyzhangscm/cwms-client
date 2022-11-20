import {  formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInSeconds} from 'date-fns';
import { interval, Subscription } from 'rxjs';

import { ProductionLineStatus } from '../models/production-line-status';
import { ProductionShiftSchedule } from '../models/production-shift-schedule';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';

@Component({
  selector: 'app-work-order-production-line-status-display',
  templateUrl: './production-line-status-display.component.html',
})
export class WorkOrderProductionLineStatusDisplayComponent implements OnInit {

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
  
  gridStyle = {
    width: '25%',
    textAlign: 'center'
  };
  
  constructor(private http: _HttpClient, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private productionLineService: ProductionLineService, 
    private workOrderConfigurationService: WorkOrderConfigurationService,
    ) { 
    

  }

  ngOnInit(): void { 
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
     
  }
}
