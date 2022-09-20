import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { ProductionLine } from '../models/production-line';
import { ProductionLineStatus } from '../models/production-line-status';
import { ProductionLineService } from '../services/production-line.service';

@Component({
  selector: 'app-work-order-production-line-dashboard',
  templateUrl: './production-line-dashboard.component.html',
  styleUrls: ['./production-line-dashboard.component.less'],
})
export class WorkOrderProductionLineDashboardComponent implements OnInit { 
  listOfProductionLineStatus: ProductionLineStatus[] = []; 
  
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
  ]; 

  // key: productionLineId
  // value: lazy loaded information
  mapOfItems: { [key: number]: string } = {};
  mapOfCapacities: { [key: number]: string } = {};


  constructor(
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private productionLineService: ProductionLineService,
    private titleService: TitleService,  ) { }

  ngOnInit(): void {
      this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.production-line-dashboard')); 
      // this.search();
      
      let currentDateTime = new Date(); 
      let shiftStart =  formatDate(currentDateTime, "YYYY-MM-dd", this.i18n.defaultLang)
      shiftStart = `${shiftStart}T16:00:00.000Z`;
      
      console.log(`shiftStart ${shiftStart}`);
      let shiftStartDateTime = new Date(shiftStart); 
      if (currentDateTime.getHours() < 16) {
        // we are before today's shift start time, then 
        // we should calculate the performance from yesterday's 4PM
        shiftStartDateTime.setDate(shiftStartDateTime.getDate() - 1);

      }
      shiftStartDateTime.setDate(shiftStartDateTime.getDate() - 10);
      console.log(`shiftStartDateTime: ${JSON.stringify(shiftStartDateTime)}`);
      
        // console.log(`shiftStart: ${JSON.stringify(new Date(shiftStart))}`);
        
        // console.log(`current date time ${JSON.stringify(currentDateTime)}`);
        // console.log(`shiftStart ${shiftStart}`);
      this.search(shiftStartDateTime, currentDateTime);

  }
  
  search(startTime: Date, endTime: Date): void {
    this.isSpinning = true; 
       

    this.productionLineService.getProductionLineStatus( 
      undefined,
      startTime, endTime,  ).subscribe({

        next: (productionLineStatusRes) => {
            this.listOfProductionLineStatus = productionLineStatusRes;
            this.isSpinning = false; 
            this.listOfProductionLineStatus.forEach(
              productionLineStatus => {
                              
                this.mapOfItems[productionLineStatus.productionLine.id!] = "";
                this.mapOfCapacities[productionLineStatus.productionLine.id!] = "";
              }
            )
            this.loadDetailInformation();
        
        },
        error: () => { 
            this.isSpinning = false; 
        }


    }); 
  }

  loadDetailInformation() {
    // load the item information
    this.loadItemInformation();
    this.loadCapacityInformation();
    
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
              this.mapOfCapacities[productionLineAttribute.productionLine.id!] = productionLineAttribute.value
            }
          )
        }
      }
    );
  }

}
