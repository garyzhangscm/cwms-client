import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegrationInventoryAttributeChangeConfirmationService } from '../services/integration-inventory-attribute-change-confirmation.service';
import { IntegrationInventoryAttributeChangeConfirmation } from '../models/integration-inventory-attribute-change-confirmation';
import { IntegrationInventoryAdjustmentConfirmation } from '../models/integration-inventory-adjustment-confirmation';
import { formatDate } from '@angular/common';
import { I18NService } from '@core';

@Component({
  selector: 'app-integration-integration-data-inventory-attribute-change',
  templateUrl: './integration-data-inventory-attribute-change.component.html',
  styleUrls: ['./integration-data-inventory-attribute-change.component.less'],
})
export class IntegrationIntegrationDataInventoryAttributeChangeComponent implements OnInit {
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationInventoryAttributeChangeConfirmations: IntegrationInventoryAttributeChangeConfirmation[] = [];
  listOfDisplayIntegrationInventoryAttributeChangeConfirmations: IntegrationInventoryAttributeChangeConfirmation[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private integrationInventoryAdjustmentConfirmationService: IntegrationInventoryAttributeChangeConfirmationService,
    private i18n: I18NService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationInventoryAttributeChangeConfirmations = [];
    this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationInventoryAdjustmentConfirmationService.getData().subscribe(
      integrationInventoryAdjustmentConfirmationRes => {
        this.listOfAllIntegrationInventoryAttributeChangeConfirmations = integrationInventoryAdjustmentConfirmationRes;
        this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = integrationInventoryAdjustmentConfirmationRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationInventoryAdjustmentConfirmationRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationInventoryAttributeChangeConfirmation[]): void {
    this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = this.listOfAllIntegrationInventoryAttributeChangeConfirmations.sort(
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
      this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = this.listOfAllIntegrationInventoryAttributeChangeConfirmations;
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
