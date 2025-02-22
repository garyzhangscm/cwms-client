import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { ProductionLine } from '../models/production-line';
import { WorkOrderLabor } from '../models/work-order-labor';
import { WorkOrderLaborActivityHistory } from '../models/work-order-labor-activity-history';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderLaborActivityHistoryService } from '../services/work-order-labor-activity-history.service';
import { WorkOrderLaborService } from '../services/work-order-labor.service';

@Component({
    selector: 'app-work-order-labor-activity',
    templateUrl: './labor-activity.component.html',
    styleUrls: ['./labor-activity.component.less'],
    standalone: false
})
export class WorkOrderLaborActivityComponent implements OnInit {
  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder, 
    private userService: UserService,
    private workOrderLaborActivityHistoryService: WorkOrderLaborActivityHistoryService,
    private productionLineService: ProductionLineService, 
    ) { 
      userService.isCurrentPageDisplayOnly("/work-order/labor-activity").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                   

  }

  listOfLaborActivities: WorkOrderLaborActivityHistory[] = [];
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
    this.listOfLaborActivities = [];


  }
  
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.workOrderLaborActivityHistoryService.getWorkOrderLabors(
      this.searchForm.controls.productionLine.value,    
      this.searchForm.controls.username.value).subscribe(
      {
        next: (workOrderLaborActivityRes) => {
          this.listOfLaborActivities = workOrderLaborActivityRes;

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: workOrderLaborActivityRes.length,
              });
        }, 
        error: () => this.isSpinning = false
      });

      
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("username"), index: 'workOrderLabor.username', iif: () => this.isChoose('username') },
    { title: this.i18n.fanyi("production-line"), index: 'workOrderLabor.productionLine.name', iif: () => this.isChoose('productionLine') }, 
    { title: this.i18n.fanyi("work-order.labor.activity-type"), index: 'activityType', iif: () => this.isChoose('activityType') }, 
    { title: this.i18n.fanyi("original-value"), index: 'originalValue', iif: () => this.isChoose('originalValue') }, 
    { title: this.i18n.fanyi("new-value"), index: 'newValue', iif: () => this.isChoose('newValue') }, 
       
    {
      title: this.i18n.fanyi("work-order.labor.activity-time"),
      renderTitle: 'activityTimeColumnTitle' ,
      render: 'activityTimeColumn',
      iif: () => this.isChoose('activityTime')
    },      
    { title: this.i18n.fanyi("work-order.labor.activity-username"), index: 'username', iif: () => this.isChoose('activityUsername') },

  ];
  customColumns = [

    { label: this.i18n.fanyi("username"), value: 'username', checked: true },
    { label: this.i18n.fanyi("production-line"), value: 'productionLine', checked: true },
    { label: this.i18n.fanyi("work-order.labor.activity-type"), value: 'activityType', checked: true },
    { label: this.i18n.fanyi("original-value"), value: 'originalValue', checked: true },
    { label: this.i18n.fanyi("new-value"), value: 'newValue', checked: true },
    { label: this.i18n.fanyi("work-order.labor.activity-time"), value: 'activityTime', checked: true },
    { label: this.i18n.fanyi("work-order.labor.activity-username"), value: 'activityUsername', checked: true },
    

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
