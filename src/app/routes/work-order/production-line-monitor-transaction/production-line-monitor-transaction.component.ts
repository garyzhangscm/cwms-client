import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms'; 
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
 
import { UserService } from '../../auth/services/user.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineMonitor } from '../models/production-line-monitor';
import { ProductionLineMonitorTransaction } from '../models/production-line-monitor-transaction';
import { ProductionLineMonitorTransactionService } from '../services/production-line-monitor-transaction.service';
import { ProductionLineMonitorService } from '../services/production-line-monitor.service';
import { ProductionLineService } from '../services/production-line.service';

@Component({
    selector: 'app-work-order-production-line-monitor-transaction',
    templateUrl: './production-line-monitor-transaction.component.html',
    styleUrls: ['./production-line-monitor-transaction.component.less'],
    standalone: false
})
export class WorkOrderProductionLineMonitorTransactionComponent implements OnInit {

  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  searchForm!: UntypedFormGroup;
  searching = false;
  searchResult = '';
  listOfProductionLineMonitorTransactions: ProductionLineMonitorTransaction[] = [];
  availableProductionLines: ProductionLine[] = [];
  availableProductionLineMonitors: ProductionLineMonitor[] = [];
  
  isSpinning = false;

  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("production-line-monitor"),  index: 'productionLineMonitor.name'   },    
    { title: this.i18n.fanyi("production-line-monitor"),  index: 'productionLineMonitor.description'   },  
    { title: this.i18n.fanyi("production-line"),  index: 'productionLine.name'   },    
    {
      title: this.i18n.fanyi("cycleTime"),  
      render: 'cycleTimeColumn', 
    },
    {
      title: this.i18n.fanyi("createdTime"),  
      render: 'createdTimeColumn', 
    }

    
  ]; 

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private productionLineMonitorTransactionService: ProductionLineMonitorTransactionService, 
    private productionLineService: ProductionLineService,
    private productionLineMonitorService: ProductionLineMonitorService,
    private xlsx: XlsxService,
    private titleService: TitleService,  
    private userService: UserService,) { 
      userService.isCurrentPageDisplayOnly("/work-order/production-line-monitor/transaction").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                          
    }

  ngOnInit(): void {
      this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.production-line-monitor-transaction'));
      // initiate the search form
      this.searchForm = this.fb.group({
        monitorName: [null],
        productionLine: [null], 
        transactionDateTimeRanger: [null],
        transactionDate: [null],
      }); 
      this.loadAllProductionLines();
      this.loadAllProductionLineMonitors();
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfProductionLineMonitorTransactions = []; 
  }

  loadAllProductionLines() : void {

    this.productionLineService.getProductionLines().subscribe(
      {
        next: (productionLineRes) => this.availableProductionLines = productionLineRes
      }
    )
  }
  loadAllProductionLineMonitors() : void {

    this.productionLineMonitorService.getProductionLineMonitors().subscribe(
      {
        next: (productionLineMonitorRes) => this.availableProductionLineMonitors = productionLineMonitorRes
      }
    )
  }
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
     
    let startTime : Date = this.searchForm.value.transactionDateTimeRanger ? 
        this.searchForm.value.transactionDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.transactionDateTimeRanger ? 
        this.searchForm.value.transactionDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.transactionDate;

    this.productionLineMonitorTransactionService.getProductionLineMonitorTransactions(
      this.searchForm.value.monitorName, 
      this.searchForm.value.productionLine, undefined,
      startTime, endTime, specificDate,  ).subscribe({

        next: (productionLineMonitorTransactionRes) => {
            this.listOfProductionLineMonitorTransactions = productionLineMonitorTransactionRes;
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: productionLineMonitorTransactionRes.length,
            });
        
        },
        error: () => { 
            this.isSpinning = false;
            this.searchResult = ''; 
        }


    });
  }
  

  createFakeData(count: number) {
    console.log(`create fake data: ${count}`);
    let cycleTime = (Math.random() * 5 + 30);
    if (count > 0) {

      this.isSpinning = true;
      setTimeout(() => {
  
        this.productionLineMonitorTransactionService.addProductionLineMonitorTransaction("TEST111", cycleTime)
        .subscribe({
          next: () =>  this.createFakeData(count - 1),
          error: () => {}
        })
      }, cycleTime * 1000); 
    }
    else {
      
      this.isSpinning = false;
    }
  }
  export() {
    this.xlsx.export({
      sheets: [
        {
          data: this.listOfProductionLineMonitorTransactions,
          name: 'monitor-transaction',
        },
      ],
    });
  }
}
