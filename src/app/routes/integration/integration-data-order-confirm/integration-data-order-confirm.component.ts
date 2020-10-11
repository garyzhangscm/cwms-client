import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core/i18n/i18n.service';
import { _HttpClient } from '@delon/theme';
import { IntegrationOrder } from '../models/integration-order';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { IntegrationOrderConfirmationService } from '../services/integration-order-confirmation.service';

@Component({
  selector: 'app-integration-integration-data-order-confirm',
  templateUrl: './integration-data-order-confirm.component.html',
  styleUrls: ['./integration-data-order-confirm.component.less'],
})
export class IntegrationIntegrationDataOrderConfirmComponent implements OnInit {
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

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

  constructor(
    private fb: FormBuilder,
    private integrationOrderConfirmationService: IntegrationOrderConfirmationService,
    private i18n: I18NService,
  ) {}

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
    this.searchResult = '';
    this.integrationOrderConfirmationService.getData().subscribe(
      integrationOrderConfirmationRes => {
        console.log(`integrationOrderConfirmationRes:${JSON.stringify(integrationOrderConfirmationRes)}`);
        this.listOfAllIntegrationOrderConfirmations = integrationOrderConfirmationRes;
        this.listOfDisplayIntegrationOrderConfirmations = integrationOrderConfirmationRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationOrderConfirmationRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationOrderConfirmation[]): void {
    this.listOfDisplayIntegrationOrderConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data 
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
