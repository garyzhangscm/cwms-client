import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationItemFamilyData } from '../models/integration-item-family-data';
import { IntegrationItemFamilyDataService } from '../services/integration-item-family-data.service';
import { formatDate } from '@angular/common';
import { I18NService } from '@core/i18n/i18n.service';

@Component({
  selector: 'app-integration-integration-data-item-family',
  templateUrl: './integration-data-item-family.component.html',
  styleUrls: ['./integration-data-item-family.component.less'],
})
export class IntegrationIntegrationDataItemFamilyComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationItemFamilyData: IntegrationItemFamilyData[] = [];
  listOfDisplayIntegrationItemFamilyData: IntegrationItemFamilyData[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationItemFamilyDataService: IntegrationItemFamilyDataService,
    private i18n: I18NService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemFamilyData = [];
    this.listOfDisplayIntegrationItemFamilyData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationItemFamilyDataService.getItemFamilyData().subscribe(
      integrationItemFamilyDataRes => {
        this.listOfAllIntegrationItemFamilyData = integrationItemFamilyDataRes;
        this.listOfDisplayIntegrationItemFamilyData = integrationItemFamilyDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemFamilyDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemFamilyData[]): void {
    this.listOfDisplayIntegrationItemFamilyData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationItemFamilyData = this.listOfAllIntegrationItemFamilyData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationItemFamilyData = this.listOfAllIntegrationItemFamilyData;
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
