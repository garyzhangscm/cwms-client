import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { QcInspectionRequest } from '../models/qc-inspection-request'; 
import { QCRuleItemType } from '../models/qc-rule-item-type';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';

@Component({
    selector: 'app-qc-qc-result',
    templateUrl: './qc-result.component.html',
    styleUrls: ['./qc-result.component.less'],
    standalone: false
})
export class QcQcResultComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  displayOnly = false;
  constructor( 
    private fb: UntypedFormBuilder, 
    private userService: UserService,
    private qcInspectionRequestService: QcInspectionRequestService, 
    private activatedRoute: ActivatedRoute,
    ) { 

      userService.isCurrentPageDisplayOnly("/qc/result").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );       
  }

  listOfQCInspectionRequest: QcInspectionRequest[] = [];

  searchResult = '';
  isSpinning = false;
  searchForm!: UntypedFormGroup; 
  qcRuleItemTypes = QCRuleItemType;

  ngOnInit(): void { 

    this.searchForm = this.fb.group({
      lpn: [null], 
      workOrderQCSampleNumber: [null],
      number: [null],
    }); 

    this.activatedRoute.queryParams.subscribe(params => {
        if (params['lpn']) {
          this.searchForm.value.lpn.setValue(params['lpn']);
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
    console.log(`search by number ${this.searchForm.value.number.value}`);
    this.qcInspectionRequestService.getQCInspectionResult(
      this.searchForm.value.lpn.value,      
      this.searchForm.value.workOrderQCSampleNumber.value,      
      this.searchForm.value.number.value).subscribe(
      {
        next: (qcInspectionRequestRes) => {
          this.listOfQCInspectionRequest = qcInspectionRequestRes;
          this.setupDisplayInventory();

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: qcInspectionRequestRes.length,
              });
        }, 
        error: () => this.isSpinning = false
      });

      
  }

  // combine inventory list and single inventory onto one display so we can 
  // show them in a signle table
  // 1. Single inventory: used for inbound QC
  // 2. inventory list: used for qc by item
  setupDisplayInventory() {
    this.listOfQCInspectionRequest.forEach(
      qcInspectionRequest => {
        if (qcInspectionRequest.inventory) {

          qcInspectionRequest.allInventories = [...qcInspectionRequest.inventories, qcInspectionRequest.inventory]
        }
        else {
          qcInspectionRequest.allInventories = qcInspectionRequest.inventories;
        }
      }
    )
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number') },
    { title: this.i18n.fanyi("lpn"), index: 'inventory.lpn', iif: () => this.isChoose('lpn') },
    { title: this.i18n.fanyi("work-order.qc-sample.number"), index: 'workOrderQCSample.number', iif: () => this.isChoose('workOrderQCSample') },
    { title: this.i18n.fanyi("work-order"), index: 'workOrder.number', iif: () => this.isChoose('workOrder') },
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
    { label: this.i18n.fanyi("work-order"), value: 'workOrder', checked: true },
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
  
  
  inventoryColumns: STColumn[] = [

    { title: this.i18n.fanyi("lpn"), index: 'lpn',   },
    { title: this.i18n.fanyi("item"), index: 'item.name',  }, 
    { title: this.i18n.fanyi("item.description"), index: 'item.description',  }, 
    { title: this.i18n.fanyi("quantity"), index: 'quantity',  }, 
    { title: this.i18n.fanyi("status"), index: 'inventoryStatus.name',  }, 

  ];
}
