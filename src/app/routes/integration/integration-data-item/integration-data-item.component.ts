import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { IntegrationItemData } from '../models/integration-item-data';
import { IntegrationItemDataService } from '../services/integration-item-data.service';

@Component({
  selector: 'app-integration-integration-data-item',
  templateUrl: './integration-data-item.component.html',
  styleUrls: ['./integration-data-item.component.less'],
})
export class IntegrationIntegrationDataItemComponent implements OnInit {
  // Form related data and functions
  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationItemData: IntegrationItemData[] = [];
  listOfDisplayIntegrationItemData: IntegrationItemData[] = [];
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
    private integrationItemDataService: IntegrationItemDataService,
    private i18n: I18NService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemData = [];
    this.listOfDisplayIntegrationItemData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationItemDataService.getItemData().subscribe(
      integrationItemDataRes => {
        console.log(`integrationItemDataRes:\n${JSON.stringify(integrationItemDataRes)}`);
        this.listOfAllIntegrationItemData = integrationItemDataRes;
        this.listOfDisplayIntegrationItemData = integrationItemDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemData[]): void {
    this.listOfDisplayIntegrationItemData = $event;
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
