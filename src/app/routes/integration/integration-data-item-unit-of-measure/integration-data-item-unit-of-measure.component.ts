import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationItemUnitOfMeasureData } from '../models/integration-item-unit-of-measure-data';
import { IntegrationItemUnitOfMeasureDataService } from '../services/integration-item-unit-of-measure-data.service';

@Component({
  selector: 'app-integration-integration-data-item-unit-of-measure',
  templateUrl: './integration-data-item-unit-of-measure.component.html',
  styleUrls: ['./integration-data-item-unit-of-measure.component.less'],
})
export class IntegrationIntegrationDataItemUnitOfMeasureComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;

  searching = false;

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
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemUnitOfMeasureData = [];
    this.listOfDisplayIntegrationItemUnitOfMeasureData = [];
  }
  search(): void {
    this.searching = true;
    this.integrationItemUnitOfMeasureDataService
      .getItemUnitOfMeasureData()
      .subscribe(integrationItemUnitOfMeasureDataRes => {
        this.listOfAllIntegrationItemUnitOfMeasureData = integrationItemUnitOfMeasureDataRes;
        this.listOfDisplayIntegrationItemUnitOfMeasureData = integrationItemUnitOfMeasureDataRes;
        this.searching = false;
      });
  }

  currentPageDataChange($event: IntegrationItemUnitOfMeasureData[]): void {
    this.listOfDisplayIntegrationItemUnitOfMeasureData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationItemUnitOfMeasureData = this.listOfAllIntegrationItemUnitOfMeasureData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationItemUnitOfMeasureData = this.listOfAllIntegrationItemUnitOfMeasureData;
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
