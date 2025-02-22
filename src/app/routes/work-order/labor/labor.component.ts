import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'; 
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service'; 
import { ProductionLine } from '../models/production-line';
import { WorkOrderLabor } from '../models/work-order-labor';
import { ProductionLineService } from '../services/production-line.service'; 
import { WorkOrderLaborService } from '../services/work-order-labor.service';

@Component({
    selector: 'app-work-order-labor',
    templateUrl: './labor.component.html',
    styleUrls: ['./labor.component.less'],
    standalone: false
})
export class WorkOrderLaborComponent implements OnInit {

  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder, 
    private workOrderLaborService: WorkOrderLaborService, 
    private productionLineService: ProductionLineService, 
    private userService: UserService,
    ) { 

      userService.isCurrentPageDisplayOnly("/work-order/labor").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                  
  }

  listOfLabors: WorkOrderLabor[] = [];
  allProductionLines: ProductionLine[] = [];

  searchResult = '';
  isSpinning = false;
  searchForm!: UntypedFormGroup; 

  ngOnInit(): void { 

    this.searchForm = this.fb.group({
      username: [null], 
      productionLine: [null],
    }); 

    this.loadProductionLines();

  }
  loadProductionLines() {
    this.productionLineService.getProductionLines().subscribe({
      next: (productionLineRes) => this.allProductionLines = productionLineRes
    })
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfLabors = [];


  }
  
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.workOrderLaborService.getWorkOrderLabors(
      this.searchForm.value.productionLine,    
      undefined,  
      this.searchForm.value.username).subscribe(
      {
        next: (workOrderLaborRes) => {
          this.listOfLabors = workOrderLaborRes;

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: workOrderLaborRes.length,
              });
        }, 
        error: () => this.isSpinning = false
      });

      
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("username"), index: 'username', iif: () => this.isChoose('username') },
    { title: this.i18n.fanyi("production-line"), index: 'productionLine.name', iif: () => this.isChoose('productionLine') }, 
    { title: this.i18n.fanyi("work-order.labor.status"), index: 'workOrderLaborStatus', iif: () => this.isChoose('workOrderLaborStatus') },    
    {
      title: this.i18n.fanyi("work-order.labor.check-in-time"),
      renderTitle: 'checkInTimeColumnTitle' ,
      render: 'checkInTimeColumn',
      iif: () => this.isChoose('checkInTime')
    },     
    {
      title: this.i18n.fanyi("work-order.labor.check-out-time"),
      renderTitle: 'checkOutTimeColumnTitle' ,
      render: 'checkOutTimeColumn',
      iif: () => this.isChoose('checkOutTime')
    }, 
    

  ];
  customColumns = [

    { label: this.i18n.fanyi("username"), value: 'username', checked: true },
    { label: this.i18n.fanyi("production-line"), value: 'productionLine', checked: true },
    { label: this.i18n.fanyi("work-order.labor.status"), value: 'workOrderLaborStatus', checked: true },
    { label: this.i18n.fanyi("work-order.labor.check-in-time"), value: 'checkInTime', checked: true },
    { label: this.i18n.fanyi("work-order.labor.check-out-time"), value: 'checkOutTime', checked: true },
    

  ];

  isChoose(key: string): boolean {
      return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
        this.st!.resetColumns({ emitReload: true });

    }
  }
}
