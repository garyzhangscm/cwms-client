import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { IntegrationInventoryAdjustmentConfirmationService } from '../services/integration-inventory-adjustment-confirmation.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegrationInventoryAdjustmentConfirmation } from '../models/integration-inventory-adjustment-confirmation';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { formatDate } from '@angular/common';
import { I18NService } from '@core';

@Component({
  selector: 'app-integration-integration-data-inventory-adjust',
  templateUrl: './integration-data-inventory-adjust.component.html',
  styleUrls: ['./integration-data-inventory-adjust.component.less'],
})
export class IntegrationIntegrationDataInventoryAdjustComponent implements OnInit {
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationInventoryAdjustmentConfirmations: IntegrationInventoryAdjustmentConfirmation[] = [];
  listOfDisplayIntegrationInventoryAdjustmentConfirmations: IntegrationInventoryAdjustmentConfirmation[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private integrationInventoryAdjustmentConfirmationService: IntegrationInventoryAdjustmentConfirmationService,
    private i18n: I18NService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationInventoryAdjustmentConfirmations = [];
    this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationInventoryAdjustmentConfirmationService
      .getData()
      .subscribe(integrationInventoryAdjustmentConfirmationRes => {
        this.listOfAllIntegrationInventoryAdjustmentConfirmations = integrationInventoryAdjustmentConfirmationRes;
        this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = integrationInventoryAdjustmentConfirmationRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationInventoryAdjustmentConfirmationRes.length,
        });
      });
  }

  currentPageDataChange($event: IntegrationInventoryAdjustmentConfirmation[]): void {
    this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = this.listOfAllIntegrationInventoryAdjustmentConfirmations.sort(
        (a, b) =>
          this.sortValue === 'ascend'
            ? a[this.sortKey!] > b[this.sortKey!]
              ? 1
              : -1
            : b[this.sortKey!] > a[this.sortKey!]
            ? 1
            : -1,
      );
    } else {
      this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = this.listOfAllIntegrationInventoryAdjustmentConfirmations;
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
