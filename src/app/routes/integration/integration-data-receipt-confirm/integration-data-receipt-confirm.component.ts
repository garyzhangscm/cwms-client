import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegrationReceiptConfirmationService } from '../services/integration-receipt-confirmation.service';
import { IntegrationReceiptConfirmation } from '../models/integration-receipt-confirmation';
import { IntegrationReceipt } from '../models/integration-receipt';

@Component({
  selector: 'app-integration-integration-data-receipt-confirm',
  templateUrl: './integration-data-receipt-confirm.component.html',
  styleUrls: ['./integration-data-receipt-confirm.component.less'],
})
export class IntegrationIntegrationDataReceiptConfirmComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private integrationReceiptConfirmationService: IntegrationReceiptConfirmationService,
  ) {}

  searchForm: FormGroup;

  searching = false;

  // Table data for display
  listOfAllIntegrationReceiptConfirmations: IntegrationReceiptConfirmation[] = [];
  listOfDisplayIntegrationReceiptConfirmations: IntegrationReceiptConfirmation[] = [];
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
    this.listOfAllIntegrationReceiptConfirmations = [];
    this.listOfDisplayIntegrationReceiptConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.integrationReceiptConfirmationService.getData().subscribe(integrationReceiptConfirmationRes => {
      this.listOfAllIntegrationReceiptConfirmations = integrationReceiptConfirmationRes;
      this.listOfDisplayIntegrationReceiptConfirmations = integrationReceiptConfirmationRes;

      this.searching = false;
    });
  }

  currentPageDataChange($event: IntegrationReceiptConfirmation[]): void {
    this.listOfDisplayIntegrationReceiptConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfAllIntegrationReceiptConfirmations = this.listOfAllIntegrationReceiptConfirmations.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfAllIntegrationReceiptConfirmations = this.listOfAllIntegrationReceiptConfirmations;
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
