import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationItemData } from '../models/integration-item-data';
import { IntegrationItemDataService } from '../services/integration-item-data.service';

@Component({
  selector: 'app-integration-integration-data-order',
  templateUrl: './integration-data-order.component.html',
})
export class IntegrationIntegrationDataOrderComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;

  searching = false;

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

  constructor(private fb: FormBuilder, private integrationItemDataService: IntegrationItemDataService) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemData = [];
    this.listOfDisplayIntegrationItemData = [];
  }
  search(): void {
    this.searching = true;
    this.integrationItemDataService.getItemData().subscribe(integrationItemDataRes => {
      this.listOfAllIntegrationItemData = integrationItemDataRes;
      this.listOfDisplayIntegrationItemData = integrationItemDataRes;
      this.searching = false;
    });
  }

  currentPageDataChange($event: IntegrationItemData[]): void {
    this.listOfDisplayIntegrationItemData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationItemData = this.listOfAllIntegrationItemData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationItemData = this.listOfAllIntegrationItemData;
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
