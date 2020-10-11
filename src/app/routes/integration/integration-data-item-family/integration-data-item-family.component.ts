import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { IntegrationItemFamilyData } from '../models/integration-item-family-data';
import { IntegrationItemFamilyDataService } from '../services/integration-item-family-data.service';

@Component({
  selector: 'app-integration-integration-data-item-family',
  templateUrl: './integration-data-item-family.component.html',
  styleUrls: ['./integration-data-item-family.component.less'],
})
export class IntegrationIntegrationDataItemFamilyComponent implements OnInit {
  // Form related data and functions
  // Form related data and functions
  searchForm!: FormGroup;

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
