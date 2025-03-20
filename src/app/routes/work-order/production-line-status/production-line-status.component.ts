import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineStatus } from '../models/production-line-status';
import { ProductionLineService } from '../services/production-line.service';

@Component({
    selector: 'app-work-order-production-line-status',
    templateUrl: './production-line-status.component.html',
    styleUrls: ['./production-line-status.component.less'],
    standalone: false
})
export class WorkOrderProductionLineStatusComponent implements OnInit {
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  searchForm!: UntypedFormGroup;
  searching = false;
  searchResult = '';
  listOfProductionLineStatus: ProductionLineStatus[] = [];
  availableProductionLines: ProductionLine[] = []; 
  
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("production-line"),  index: 'productionLine.name'   },    
    { title: this.i18n.fanyi("active"),  index: 'active'   },   
    {
      title: this.i18n.fanyi("lastCycleTime"),  
      render: 'lastCycleTimeColumn', 
    },
    { title: this.i18n.fanyi("totalCycles"),  index: 'totalCycles'   },   
    {
      title: this.i18n.fanyi("lastCycleHappensTiming"),  
      render: 'lastCycleHappensTimingColumn', 
    },
    {
      title: this.i18n.fanyi("averageCycleTime"),  
      render: 'averageCycleTimeColumn', 
    },
    {
      title: this.i18n.fanyi("startTime"),  
      render: 'startTimeColumn', 
    },
    {
      title: this.i18n.fanyi("endTime"),  
      render: 'endTimeColumn', 
    }
  ]; 

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private productionLineService: ProductionLineService,
    private titleService: TitleService, 
    private userService: UserService, ) {
      userService.isCurrentPageDisplayOnly("/work-order/production-line-status").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                           
    }

  ngOnInit(): void {
      this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.production-line-status'));
      // initiate the search form
      this.searchForm = this.fb.group({ 
        productionLine: [null], 
        transactionDateTimeRanger: [null], 
      }); 
      this.loadAllProductionLines(); 
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfProductionLineStatus = []; 
  }

  loadAllProductionLines() : void {

    this.productionLineService.getProductionLines().subscribe(
      {
        next: (productionLineRes) => this.availableProductionLines = productionLineRes
      }
    )
  } 
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
     
    let startTime : Date = this.searchForm.value.transactionDateTimeRanger ? 
        this.searchForm.value.transactionDateTimeRanger[0] : undefined; 
    let endTime : Date = this.searchForm.value.transactionDateTimeRanger ? 
        this.searchForm.value.transactionDateTimeRanger[1] : undefined;  

    this.productionLineService.getProductionLineStatus( 
      this.searchForm.value.productionLine,
      startTime, endTime,  ).subscribe({

        next: (productionLineStatusRes) => {
            this.listOfProductionLineStatus = productionLineStatusRes;
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: productionLineStatusRes.length,
            });
        
        },
        error: () => { 
            this.isSpinning = false;
            this.searchResult = ''; 
        }


    });
  }
   

}
