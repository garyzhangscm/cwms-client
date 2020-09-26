import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationItemPackageTypeData } from '../models/integration-item-package-type-data';
import { IntegrationItemPackageTypeDataService } from '../services/integration-item-package-type-data.service';
import { formatDate } from '@angular/common';
import { I18NService } from '@core';

@Component({
  selector: 'app-integration-integration-data-item-package-type',
  templateUrl: './integration-data-item-package-type.component.html',
  styleUrls: ['./integration-data-item-package-type.component.less'],
})
export class IntegrationIntegrationDataItemPackageTypeComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationItemPackageTypeData: IntegrationItemPackageTypeData[] = [];
  listOfDisplayIntegrationItemPackageTypeData: IntegrationItemPackageTypeData[] = [];
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
    private integrationItemPackageTypeDataService: IntegrationItemPackageTypeDataService,
    private i18n: I18NService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemPackageTypeData = [];
    this.listOfDisplayIntegrationItemPackageTypeData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationItemPackageTypeDataService.getItemPackageTypeData().subscribe(
      integrationItemPackageTypeDataRes => {
        this.listOfAllIntegrationItemPackageTypeData = integrationItemPackageTypeDataRes;
        this.listOfDisplayIntegrationItemPackageTypeData = integrationItemPackageTypeDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemPackageTypeDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemPackageTypeData[]): void {
    this.listOfDisplayIntegrationItemPackageTypeData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationItemPackageTypeData = this.listOfAllIntegrationItemPackageTypeData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationItemPackageTypeData = this.listOfAllIntegrationItemPackageTypeData;
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
