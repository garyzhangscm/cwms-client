import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { IntegrationItemPackageTypeData } from '../models/integration-item-package-type-data';
import { IntegrationItemPackageTypeDataService } from '../services/integration-item-package-type-data.service';

@Component({
  selector: 'app-integration-integration-data-item-package-type',
  templateUrl: './integration-data-item-package-type.component.html',
  styleUrls: ['./integration-data-item-package-type.component.less'],
})
export class IntegrationIntegrationDataItemPackageTypeComponent implements OnInit {
  // Form related data and functions
  // Form related data and functions
  searchForm!: FormGroup;

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
  }

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });
  }
}
