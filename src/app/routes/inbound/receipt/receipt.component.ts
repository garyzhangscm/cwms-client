import { Component, OnInit } from '@angular/core';
import { TitleService, _HttpClient } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { Receipt } from '../models/receipt';
import { ReceiptService } from '../services/receipt.service';
import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-inbound-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.less'],
})
export class InboundReceiptComponent implements OnInit {
  receiptStatus = ReceiptStatus;

  // Form related data and functions
  searchForm: FormGroup;
  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllReceipts: Receipt[] = [];
  listOfDisplayReceipts: Receipt[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByClient = [];
  filtersBySupplier = [];
  filtersByStatus = [];
  // Save filters that already selected
  selectedFiltersByClient: string[] = [];
  selectedFiltersBySupplier: string[] = [];
  selectedFiltersByStatus: string[] = [];

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private receiptService: ReceiptService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
  ) {}
  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inbound.receipt'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllReceipts = [];
    this.listOfDisplayReceipts = [];
    this.filtersByClient = [];
    this.filtersBySupplier = [];
    this.selectedFiltersByClient = [];
    this.selectedFiltersBySupplier = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.receiptService.getReceipts(this.searchForm.controls.number.value).subscribe(
      receiptRes => {
        this.listOfAllReceipts = this.calculateQuantities(receiptRes);
        this.listOfDisplayReceipts = this.calculateQuantities(receiptRes);

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: receiptRes.length,
        });

        this.filtersByClient = [];
        this.filtersBySupplier = [];
        this.filtersByStatus = [];
        const existingClientId = new Set();
        const existingSupplierId = new Set();
        const existingStatus = new Set();

        this.listOfAllReceipts.forEach(receipt => {
          if (receipt.client && !existingClientId.has(receipt.client.id)) {
            this.filtersByClient.push({ text: receipt.client.name, value: receipt.client.id });
            existingClientId.add(receipt.client.id);
          }
          if (receipt.supplier && !existingSupplierId.has(receipt.supplier.id)) {
            this.filtersBySupplier.push({ text: receipt.supplier.name, value: receipt.supplier.id });
            existingSupplierId.add(receipt.supplier.id);
          }
          if (!existingStatus.has(receipt.receiptStatus)) {
            this.filtersByStatus.push({ text: receipt.receiptStatus, value: receipt.receiptStatus });
            existingStatus.add(receipt.receiptStatus);
          }
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  calculateQuantities(receipts: Receipt[]): Receipt[] {
    receipts.forEach(receipt => {
      const existingItemIds = new Set();
      receipt.totalExpectedQuantity = 0;
      receipt.totalReceivedQuantity = 0;
      receipt.totalLineCount = receipt.receiptLines.length;

      receipt.receiptLines.forEach(receiptLine => {
        receipt.totalExpectedQuantity += receiptLine.expectedQuantity;
        receipt.totalReceivedQuantity += receiptLine.receivedQuantity;
        if (!existingItemIds.has(receiptLine.item.id)) {
          existingItemIds.add(receiptLine.item.id);
        }
      });
      receipt.totalItemCount = existingItemIds.size;
    });
    return receipts;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayReceipts.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayReceipts.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayReceipts.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByClient: string[], selectedFiltersBySupplier: string[], selectedFiltersByStatus: string[]) {
    this.selectedFiltersByClient = selectedFiltersByClient;
    this.selectedFiltersBySupplier = selectedFiltersBySupplier;
    this.selectedFiltersByStatus = selectedFiltersByStatus;
    this.sortAndFilter();
  }

  sortAndFilter() {
    // filter data
    const filterFunc = (item: { client: Client; supplier: Supplier; receiptStatus: ReceiptStatus }) =>
      this.selectedFiltersByClient.length
        ? this.selectedFiltersByClient.some(id => item.client.id === +id)
        : true && this.selectedFiltersBySupplier.length
        ? this.selectedFiltersBySupplier.some(id => item.supplier.id === +id)
        : true && this.selectedFiltersByStatus.length
        ? this.selectedFiltersByStatus.some(status => item.receiptStatus === status)
        : true;

    const data = this.listOfAllReceipts.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayReceipts = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayReceipts = data;
    }
  }

  removeSelectedReceipts(): void {
    // make sure we have at least one checkbox checked
    const selectedReceipts = this.getSelectedReceipts();
    if (selectedReceipts.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
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
      if (this.mapOfCheckedId[receipt.id] === true) {
        selectedReceipts.push(receipt);
      }
    });
    return selectedReceipts;
  }

  checkInReceipt(receipt: Receipt) {
    this.receiptService.checkInReceipt(receipt).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  closeReceipt(receipt: Receipt) {
    this.receiptService.closeReceipt(receipt).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
}
