import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegrationWorkOrderConfirmationService } from '../services/integration-work-order-confirmation.service';
import { IntegrationWorkOrderConfirmation } from '../models/integration-work-order-confirmation';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';

@Component({
  selector: 'app-integration-integration-data-work-order-confirm',
  templateUrl: './integration-data-work-order-confirm.component.html',
  styleUrls: ['./integration-data-work-order-confirm.component.less'],
})
export class IntegrationIntegrationDataWorkOrderConfirmComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private integrationWorkOrderConfirmationService: IntegrationWorkOrderConfirmationService,
  ) {}

  searchForm: FormGroup;

  searching = false;

  // Table data for display
  listOfAllIntegrationWorkOrderConfirmations: IntegrationWorkOrderConfirmation[] = [];
  listOfDisplayIntegrationWorkOrderConfirmations: IntegrationWorkOrderConfirmation[] = [];
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
    this.listOfAllIntegrationWorkOrderConfirmations = [];
    this.listOfDisplayIntegrationWorkOrderConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.integrationWorkOrderConfirmationService.getData().subscribe(integrationWorkOrderConfirmationRes => {
      console.log(`integrationOrderConfirmationRes:${JSON.stringify(integrationWorkOrderConfirmationRes)}`);
      this.listOfAllIntegrationWorkOrderConfirmations = integrationWorkOrderConfirmationRes;
      this.listOfDisplayIntegrationWorkOrderConfirmations = integrationWorkOrderConfirmationRes;

      this.searching = false;
    });
  }

  currentPageDataChange($event: IntegrationWorkOrderConfirmation[]): void {
    this.listOfDisplayIntegrationWorkOrderConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationWorkOrderConfirmations = this.listOfAllIntegrationWorkOrderConfirmations.sort(
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
      this.listOfDisplayIntegrationWorkOrderConfirmations = this.listOfAllIntegrationWorkOrderConfirmations;
    }
  }

  ngOnInit() {
    this.initSearchForm();
    this.searching = false;
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });
  }
}
