import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QCRule } from '../models/qc-rule';
import { QCRuleItemType } from '../models/qc-rule-item-type';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';

@Component({
  selector: 'app-qc-qc-result',
  templateUrl: './qc-result.component.html',
  styleUrls: ['./qc-result.component.less'],
})
export class QcQcResultComponent implements OnInit {

  constructor(private http: _HttpClient,    
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService, 
    private messageService: NzMessageService,
    private qcInspectionRequestService: QcInspectionRequestService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    ) { 

  }

  listOfQCInspectionRequest: QcInspectionRequest[] = [];

  searchResult = '';
  isSpinning = false;
  searchForm!: FormGroup; 
  qcRuleItemTypes = QCRuleItemType;

  ngOnInit(): void { 

    this.searchForm = this.fb.group({
      lpn: [null], 
      workOrderQCSampleNumber: [null],
    }); 

    this.activatedRoute.queryParams.subscribe(params => {
        if (params.lpn) {
          this.searchForm.controls.lpn.setValue(params.lpn);
          this.search();
        }
    });

  }
 

  resetForm(): void {
    this.searchForm.reset();
    this.listOfQCInspectionRequest = [];


  }
  
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.qcInspectionRequestService.getQCInspectionResult(
      this.searchForm.controls.lpn.value,      
      this.searchForm.controls.workOrderQCSampleNumber.value).subscribe(
      {
        next: (qcInspectionRequestRes) => {
          this.listOfQCInspectionRequest = qcInspectionRequestRes;

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: qcInspectionRequestRes.length,
              });
        }, 
        error: () => this.isSpinning = false
      });

      
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number') },
    { title: this.i18n.fanyi("lpn"), index: 'inventory.lpn', iif: () => this.isChoose('lpn') },
    { title: this.i18n.fanyi("work-order.qc-sample.number"), index: 'workOrderQCSample.number', iif: () => this.isChoose('workOrderQCSample') },
    { title: this.i18n.fanyi("item.name"), index: 'inventory.item.name', iif: () => this.isChoose('itemName') },
    { title: this.i18n.fanyi("item.description"), index: 'inventory.item.description', iif: () => this.isChoose('itemDescription') },
    { title: this.i18n.fanyi("qc-result"), index: 'qcInspectionResult', iif: () => this.isChoose('qcResult') },
    // { title: this.i18n.fanyi("qc-time"), index: 'qcTime', iif: () => this.isChoose('qcTime') },
     
    {
      title: this.i18n.fanyi("qc-inspection-time"),
      renderTitle: 'qcTimeColumnTitle' ,
      render: 'qcTimeColumn',
      iif: () => this.isChoose('qcTime')
    }, 
    { title: this.i18n.fanyi("username"), index: 'qcUsername', iif: () => this.isChoose('username') },

  ];
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("lpn"), value: 'lpn', checked: true },
    { label: this.i18n.fanyi("work-order.qc-sample.number"), value: 'workOrderQCSample', checked: true },
    { label: this.i18n.fanyi("item.name"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true },
    { label: this.i18n.fanyi("qcResult"), value: 'qcResult', checked: true },
    { label: this.i18n.fanyi("qc-inspection-time"), value: 'qcTime', checked: true },
    { label: this.i18n.fanyi("username"), value: 'username', checked: true },

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
