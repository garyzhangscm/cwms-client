import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core/i18n/i18n.service';
import { _HttpClient } from '@delon/theme';
import { IntegrationItemUnitOfMeasureData } from '../models/integration-item-unit-of-measure-data';
import { IntegrationItemUnitOfMeasureDataService } from '../services/integration-item-unit-of-measure-data.service';

@Component({
  selector: 'app-integration-integration-data-item-unit-of-measure',
  templateUrl: './integration-data-item-unit-of-measure.component.html',
  styleUrls: ['./integration-data-item-unit-of-measure.component.less'],
})
export class IntegrationIntegrationDataItemUnitOfMeasureComponent implements OnInit {
  // Form related data and functions
  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationItemUnitOfMeasureData: IntegrationItemUnitOfMeasureData[] = [];
  listOfDisplayIntegrationItemUnitOfMeasureData: IntegrationItemUnitOfMeasureData[] = [];
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
    private integrationItemUnitOfMeasureDataService: IntegrationItemUnitOfMeasureDataService,
    private i18n: I18NService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemUnitOfMeasureData = [];
    this.listOfDisplayIntegrationItemUnitOfMeasureData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationItemUnitOfMeasureDataService.getItemUnitOfMeasureData().subscribe(
      integrationItemUnitOfMeasureDataRes => {
        this.listOfAllIntegrationItemUnitOfMeasureData = integrationItemUnitOfMeasureDataRes;
        this.listOfDisplayIntegrationItemUnitOfMeasureData = integrationItemUnitOfMeasureDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemUnitOfMeasureDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemUnitOfMeasureData[]): void {
    this.listOfDisplayIntegrationItemUnitOfMeasureData = $event;
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
