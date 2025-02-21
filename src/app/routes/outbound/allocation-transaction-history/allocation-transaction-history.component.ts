import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { AllocationTransactionHistory } from '../models/allocation-transaction-history';
import { AllocationTransactionHistoryService } from '../services/allocation-transaction-history.service';

@Component({
    selector: 'app-outbound-allocation-transaction-history',
    templateUrl: './allocation-transaction-history.component.html',
    styleUrls: ['./allocation-transaction-history.component.less'],
    standalone: false
})
export class OutboundAllocationTransactionHistoryComponent implements OnInit {

  searchForm!: UntypedFormGroup;
  isSpinning = false;
  searchResult = '';
  listOfAllAllocationTransactionHistories: AllocationTransactionHistory[] = [];


  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number'), width: 150},
    { title: this.i18n.fanyi("transactionGroupId"), index: 'transactionGroupId', iif: () => this.isChoose('transactionGroupId'), width: 150 },
    { title: this.i18n.fanyi("orderNumber"), index: 'orderNumber', iif: () => this.isChoose('orderNumber'), width: 100 },
    { title: this.i18n.fanyi("workOrderNumber"), index: 'workOrderNumber', iif: () => this.isChoose('workOrderNumber'),width: 100 },
    { title: this.i18n.fanyi("itemName"), index: 'itemName', iif: () => this.isChoose('itemName'), width: 100},    
    { title: this.i18n.fanyi("locationName"), index: 'locationName', iif: () => this.isChoose('locationName'), width: 100}, 
    { title: this.i18n.fanyi("totalRequiredQuantity"), index: 'totalRequiredQuantity', iif: () => this.isChoose('totalRequiredQuantity'), width: 100},
    { title: this.i18n.fanyi("currentRequiredQuantity"), index: 'currentRequiredQuantity', iif: () => this.isChoose('currentRequiredQuantity'), width: 100},
    { title: this.i18n.fanyi("totalInventoryQuantity"), index: 'totalInventoryQuantity', iif: () => this.isChoose('totalInventoryQuantity'), width: 100},
    { title: this.i18n.fanyi("totalAvailableQuantity"), index: 'totalAvailableQuantity', iif: () => this.isChoose('totalAvailableQuantity'), width: 100},
    { title: this.i18n.fanyi("totalAllocatedQuantity"), index: 'totalAllocatedQuantity', iif: () => this.isChoose('totalAllocatedQuantity'), width: 100},
    { title: this.i18n.fanyi("alreadyAllocatedQuantity"), index: 'alreadyAllocatedQuantity', iif: () => this.isChoose('alreadyAllocatedQuantity'), width: 100},
    { title: this.i18n.fanyi("isSkippedFlag"), index: 'isSkippedFlag', iif: () => this.isChoose('isSkippedFlag'), width: 100},
    { title: this.i18n.fanyi("isAllocatedByLPNFlag"), index: 'isAllocatedByLPNFlag', iif: () => this.isChoose('isAllocatedByLPNFlag'), width: 100},
    { title: this.i18n.fanyi("isRoundUpFlag"), index: 'isRoundUpFlag', iif: () => this.isChoose('isRoundUpFlag'), width: 100},
    { title: this.i18n.fanyi("username"), index: 'username', iif: () => this.isChoose('username'), width: 100},
    { title: this.i18n.fanyi("message"), index: 'message', iif: () => this.isChoose('message'), width: 100},
   
   
  ];
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("transactionGroupId"), value: 'transactionGroupId', checked: true },
    { label: this.i18n.fanyi("orderNumber"), value: 'orderNumber', checked: true },
    { label: this.i18n.fanyi("workOrderNumber"), value: 'workOrderNumber', checked: true },
    { label: this.i18n.fanyi("itemName"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("locationName"), value: 'locationName', checked: true },
    { label: this.i18n.fanyi("totalRequiredQuantity"), value: 'totalRequiredQuantity', checked: true },
    { label: this.i18n.fanyi("currentRequiredQuantity"), value: 'currentRequiredQuantity', checked: true },
    { label: this.i18n.fanyi("totalInventoryQuantity"), value: 'totalInventoryQuantity', checked: true },
    { label: this.i18n.fanyi("totalAvailableQuantity"), value: 'totalAvailableQuantity', checked: true },
    { label: this.i18n.fanyi("totalAllocatedQuantity"), value: 'totalAllocatedQuantity', checked: true },
    { label: this.i18n.fanyi("alreadyAllocatedQuantity"), value: 'alreadyAllocatedQuantity', checked: true },
    { label: this.i18n.fanyi("isSkippedFlag"), value: 'isSkippedFlag', checked: true },
    { label: this.i18n.fanyi("isAllocatedByLPNFlag"), value: 'isAllocatedByLPNFlag', checked: true },
    { label: this.i18n.fanyi("isRoundUpFlag"), value: 'isRoundUpFlag', checked: true },
    { label: this.i18n.fanyi("username"), value: 'username', checked: true },
    { label: this.i18n.fanyi("message"), value: 'message', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }


  displayOnly = false;
  constructor(private http: _HttpClient,
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private userService: UserService,
    private allocationTransactionHistoryService: AllocationTransactionHistoryService) { 
      
      userService.isCurrentPageDisplayOnly("/outbound/allocation-transaction-history").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                   
    }

  ngOnInit(): void { 
    this.searchForm = this.fb.group({
      transactionGroupId: [null],
      number: [null],
      itemName: [null],
      orderNumber: [null],
      workOrderNumber: [null],
      locationName: [null], 
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllAllocationTransactionHistories = []; 

  }

  
  search(expandedOrderId?: number, tabSelectedIndex?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
     

    this.allocationTransactionHistoryService.getAllocationTransactionHistories(
      this.searchForm.controls.number.value, 
      this.searchForm.controls.transactionGroupId.value, 
      this.searchForm.controls.orderNumber.value, 
      this.searchForm.controls.workOrderNumber.value, 
      this.searchForm.controls.itemName.value, 
      this.searchForm.controls.locationName.value, 
      false).subscribe(
        allocationTransactionHistoryRes => {
  
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: allocationTransactionHistoryRes.length,
        });
        
        this.listOfAllAllocationTransactionHistories  = allocationTransactionHistoryRes;
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }
 
}
