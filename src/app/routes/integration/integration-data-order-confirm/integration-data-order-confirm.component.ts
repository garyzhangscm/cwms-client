import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegrationOrderConfirmationService } from '../services/integration-order-confirmation.service';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { IntegrationOrder } from '../models/integration-order';

@Component({
  selector: 'app-integration-integration-data-order-confirm',
  templateUrl: './integration-data-order-confirm.component.html',
  styleUrls: ['./integration-data-order-confirm.component.less'],
})
export class IntegrationIntegrationDataOrderConfirmComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private integrationOrderConfirmationService: IntegrationOrderConfirmationService,
  ) {}

  searchForm: FormGroup;

  searching = false;

  // Table data for display
  listOfAllIntegrationOrderConfirmations: IntegrationOrderConfirmation[] = [];
  listOfDisplayIntegrationOrderConfirmations: IntegrationOrderConfirmation[] = [];
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

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationOrderConfirmations = [];
    this.listOfDisplayIntegrationOrderConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.integrationOrderConfirmationService.getData().subscribe(integrationOrderConfirmationRes => {
      this.listOfAllIntegrationOrderConfirmations = integrationOrderConfirmationRes;
      this.listOfDisplayIntegrationOrderConfirmations = integrationOrderConfirmationRes;

      this.searching = false;
    });
  }

  currentPageDataChange($event: IntegrationOrderConfirmation[]): void {
    this.listOfDisplayIntegrationOrderConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationOrderConfirmations = this.listOfAllIntegrationOrderConfirmations.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationOrderConfirmations = this.listOfAllIntegrationOrderConfirmations;
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
