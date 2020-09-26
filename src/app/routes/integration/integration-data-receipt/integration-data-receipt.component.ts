import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegrationReceiptService } from '../services/integration-receipt.service';
import { IntegrationReceipt } from '../models/integration-receipt';
import { I18NService } from '@core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-integration-integration-data-receipt',
  templateUrl: './integration-data-receipt.component.html',
  styleUrls: ['./integration-data-receipt.component.less'],
})
export class IntegrationIntegrationDataReceiptComponent implements OnInit {
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationReceipts: IntegrationReceipt[] = [];
  listOfDisplayIntegrationReceipts: IntegrationReceipt[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private integrationReceiptService: IntegrationReceiptService,
    private i18n: I18NService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationReceipts = [];
    this.listOfDisplayIntegrationReceipts = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationReceiptService.getData().subscribe(
      integrationReceiptRes => {
        this.listOfAllIntegrationReceipts = integrationReceiptRes;
        this.listOfDisplayIntegrationReceipts = integrationReceiptRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationReceiptRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationReceipt[]): void {
    this.listOfDisplayIntegrationReceipts = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfAllIntegrationReceipts = this.listOfAllIntegrationReceipts.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfAllIntegrationReceipts = this.listOfAllIntegrationReceipts;
    }
  }

  ngOnInit() {
    this.initSearchForm();
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });
  }
}
