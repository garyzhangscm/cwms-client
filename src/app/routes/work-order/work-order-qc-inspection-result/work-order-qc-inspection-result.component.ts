import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ProductionLine } from '../models/production-line';
import { WorkOrderQcResult } from '../models/work-order-qc-result';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderQcResultService } from '../services/work-order-qc-result.service';

@Component({
    selector: 'app-work-order-work-order-qc-inspection-result',
    templateUrl: './work-order-qc-inspection-result.component.html',
    styleUrls: ['./work-order-qc-inspection-result.component.less'],
    standalone: false
})
export class WorkOrderWorkOrderQcInspectionResultComponent implements OnInit {
  
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  constructor(private http: _HttpClient,    
    private fb: UntypedFormBuilder,
    private modalService: NzModalService, 
    private messageService: NzMessageService,
    private workOrderQcResultService: WorkOrderQcResultService,
    private productionLineService: ProductionLineService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    ) { 

  }

  listOfWorkOrderQcResult: WorkOrderQcResult[] = [];
  allProductionLines: ProductionLine[] = [];

  searchResult = '';
  isSpinning = false;
  searchForm!: UntypedFormGroup; 

  ngOnInit(): void { 

    this.searchForm = this.fb.group({
      number: [null], 
      workOrderQCSampleNumber: [null], 
      workOrderNumber: [null], 
      productionLineId: [null], 
    }); 

    this.activatedRoute.queryParams.subscribe(params => {
        if (params['number']) {
          this.searchForm.value.lpn.setValue(params['number']);
          this.search();
        }
    });

    this.loadProductionLines();

  }

  loadProductionLines() {
    this.productionLineService.getProductionLines().subscribe({
      next: (productoniLineRes) => this.allProductionLines = productoniLineRes
    })
  }
 

  resetForm(): void {
    this.searchForm.reset();
    this.listOfWorkOrderQcResult = [];


  }
  
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.workOrderQcResultService.getWorkOrderQcResults(
      this.searchForm.value.number.value,
      this.searchForm.value.workOrderQCSampleNumber.value,
      this.searchForm.value.productionLineId.value,
      undefined,
      this.searchForm.value.workOrderNumber.value).subscribe(
      {
        next: (workOrderQcResultRes) => {
          this.listOfWorkOrderQcResult = workOrderQcResultRes;

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: workOrderQcResultRes.length,
              });
        }, 
        error: () => this.isSpinning = false
      });

      
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number') },
    { title: this.i18n.fanyi("work-order.qc-sample.number"), index: 'workOrderQCSample.number', iif: () => this.isChoose('workOrderQCSampleNumber') },
    { title: this.i18n.fanyi("work-order"), index: 'workOrderQCSample.productionLineAssignment.workOrder.number', iif: () => this.isChoose('workOrder') },
    { title: this.i18n.fanyi("production-line"), index: 'workOrderQCSample.productionLineAssignment.productionLine.name', 
    iif: () => this.isChoose('productionLine') },
    { title: this.i18n.fanyi("qc-result"), index: 'qcInspectionResult', iif: () => this.isChoose('qcResult') },
    {
      title: this.i18n.fanyi("qc-inspection-time"),
      renderTitle: 'qcTimeColumnTitle' ,
      render: 'qcTimeColumn',
      iif: () => this.isChoose('qcTime')
    },
    { title: this.i18n.fanyi("username"), index: 'qcUsername', iif: () => this.isChoose('username') },
    { title: this.i18n.fanyi("rfCode"), index: 'qcRFCode', iif: () => this.isChoose('qcRFCode') },

  ];
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("work-order.qc-sample.number"), value: 'workOrderQCSampleNumber', checked: true },
    { label: this.i18n.fanyi("work-order"), value: 'workOrder', checked: true },
    { label: this.i18n.fanyi("production-line"), value: 'productionLine', checked: true },
    { label: this.i18n.fanyi("qc-result"), value: 'qcResult', checked: true },
    { label: this.i18n.fanyi("qc-inspection-time"), value: 'qcTime', checked: true },
    { label: this.i18n.fanyi("username"), value: 'username', checked: true },
    { label: this.i18n.fanyi("rfCode"), value: 'qcRFCode', checked: true },

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
