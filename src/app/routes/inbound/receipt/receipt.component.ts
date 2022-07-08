import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { ClientService } from '../../common/services/client.service';
import { SupplierService } from '../../common/services/supplier.service';
import { ItemService } from '../../inventory/services/item.service';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { Receipt } from '../models/receipt';
import { ReceiptLine } from '../models/receipt-line';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-inbound-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.less'],
})
export class InboundReceiptComponent implements OnInit {
  listOfColumns: ColumnItem[] = [
    {
      name: 'receipt.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => a.number.localeCompare(b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'client',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'supplier',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableObjField(a.supplier, b.supplier, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'supplier',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableObjField(a.supplier, b.supplier, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => a.receiptStatus.localeCompare(b.receiptStatus),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalLineCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalLineCount, b.totalLineCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalItemCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalExpectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalExpectedQuantity, b.totalExpectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalReceivedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalReceivedQuantity, b.totalReceivedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  isSpinning = false;
  validSuppliers: Supplier[] = [];

  receiptStatus = ReceiptStatus;

  // Form related data and functions
  searchForm!: FormGroup;
  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllReceipts: Receipt[] = [];
  listOfDisplayReceipts: Receipt[] = [];
  receiptStatusList = ReceiptStatus;


  constructor(
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private receiptService: ReceiptService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
    private supplierService: SupplierService,
  ) { }
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inbound.receipt'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      statusList: [null],
      supplier: [null],
      checkInDateTimeRanger: [null],
      checkInDate: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm!.controls.number.setValue(params.number);
        this.search();
      }
    });

    
    this.supplierService.loadSuppliers().subscribe(suppliers => (this.validSuppliers = suppliers));
  }

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllReceipts = [];
    this.listOfDisplayReceipts = [];

  }

  search(): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';

    
    let checkInStartTime : Date = this.searchForm.controls.checkInDateTimeRanger.value ? 
        this.searchForm.controls.checkInDateTimeRanger.value[0] : undefined; 
    let checkInEndTime : Date = this.searchForm.controls.checkInDateTimeRanger.value ? 
        this.searchForm.controls.checkInDateTimeRanger.value[1] : undefined; 
    let checkInSpecificDate : Date = this.searchForm.controls.checkInDate.value;

    this.receiptService.getReceipts(this.searchForm!.controls.number.value, false,       
      this.searchForm!.controls.statusList.value,       
      this.searchForm!.controls.supplier.value,
      checkInStartTime, checkInEndTime, checkInSpecificDate).subscribe(
      receiptRes => {

        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: receiptRes.length,
        });

        
        this.refreshDetailInformations(receiptRes);
        this.listOfAllReceipts = this.calculateQuantities(receiptRes);
        this.listOfDisplayReceipts = this.calculateQuantities(receiptRes);


      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }
  // we will load the client / supplier / item information 
  // asyncronized
  refreshDetailInformations(receipts: Receipt[]) { 
    receipts.forEach(
      receipt => this.refreshDetailInformation(receipt)
    );
  }
  refreshDetailInformation(receipt: Receipt) {
  
      this.loadClient(receipt); 
     
      this.loadSupplier(receipt); 

      // this.loadItems(receipt);
  }
  loadClient(receipt: Receipt) {
     
    if (receipt.clientId && receipt.client == null) {
      this.localCacheService.getClient(receipt.clientId).subscribe(
        {
          next: (clientRes) => receipt.client = clientRes
        }
      );
      
    }
  }
  
  loadSupplier(receipt: Receipt) { 
    if (receipt.supplierId && receipt.supplier == null) {
      
      this.localCacheService.getSupplier(receipt.supplierId).subscribe(
        {
          next: (supplierRes) => receipt.supplier = supplierRes
        }
      );
    }
  }

  
  loadItems(receipt: Receipt) {
     receipt.receiptLines.forEach(
       receiptLine => this.loadItem(receiptLine)
     );
  }

  loadItem(receiptLine: ReceiptLine) {
    if (receiptLine.itemId && receiptLine.item == null) { 
      
      this.localCacheService.getItem(receiptLine.itemId).subscribe(
        {
          next: (itemRes) => receiptLine.item = itemRes
        }
      );
    }
  }

  calculateQuantities(receipts: Receipt[]): Receipt[] {
    receipts.forEach(receipt => {
      const existingItemIds = new Set();
      receipt.totalExpectedQuantity = 0;
      receipt.totalReceivedQuantity = 0;
      receipt.totalLineCount = receipt.receiptLines.length;

      receipt.receiptLines.forEach(receiptLine => {
        receipt.totalExpectedQuantity! += receiptLine.expectedQuantity!;
        receipt.totalReceivedQuantity! += receiptLine.receivedQuantity!;
        if (!existingItemIds.has(receiptLine.itemId)) {
          existingItemIds.add(receiptLine.itemId);
        }
      });
      receipt.totalItemCount = existingItemIds.size;
    });
    return receipts;
  }


  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayReceipts!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Receipt[]): void {
    this.listOfDisplayReceipts! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayReceipts!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayReceipts!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }


  removeSelectedReceipts(): void {
    // make sure we have at least one checkbox checked
    const selectedReceipts = this.getSelectedReceipts();
    if (selectedReceipts.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.receiptService.removeReceipts(selectedReceipts).subscribe(res => {
            console.log('selected receipt removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedReceipts(): Receipt[] {
    const selectedReceipts: Receipt[] = [];
    this.listOfAllReceipts.forEach((receipt: Receipt) => {
      if (this.setOfCheckedId.has(receipt.id!)) {
        selectedReceipts.push(receipt);
      }
    });
    return selectedReceipts;
  }

  checkInReceipt(receipt: Receipt): void {
    this.isSpinning = true;
    this.receiptService.checkInReceipt(receipt).subscribe({
      next: () => {
        this.isSpinning = false;

        this.message.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }

  closeReceipt(receipt: Receipt): void {
    this.isSpinning = true;
    this.receiptService.closeReceipt(receipt).subscribe({
      next: () => {
        this.isSpinning = false;
        this.message.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }
}
