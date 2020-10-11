import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core/i18n/i18n.service';
import { _HttpClient } from '@delon/theme';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { IntegrationWorkOrderConfirmation } from '../models/integration-work-order-confirmation';
import { IntegrationWorkOrderConfirmationService } from '../services/integration-work-order-confirmation.service';

@Component({
  selector: 'app-integration-integration-data-work-order-confirm',
  templateUrl: './integration-data-work-order-confirm.component.html',
  styleUrls: ['./integration-data-work-order-confirm.component.less'],
})
export class IntegrationIntegrationDataWorkOrderConfirmComponent implements OnInit {
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

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
  constructor(
    private fb: FormBuilder,
    private integrationWorkOrderConfirmationService: IntegrationWorkOrderConfirmationService,
    private i18n: I18NService,
  ) {}

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
    this.searchResult = '';
    this.integrationWorkOrderConfirmationService.getData().subscribe(
      integrationWorkOrderConfirmationRes => {
        console.log(`integrationOrderConfirmationRes:${JSON.stringify(integrationWorkOrderConfirmationRes)}`);
        this.listOfAllIntegrationWorkOrderConfirmations = integrationWorkOrderConfirmationRes;
        this.listOfDisplayIntegrationWorkOrderConfirmations = integrationWorkOrderConfirmationRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationWorkOrderConfirmationRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationWorkOrderConfirmation[]): void {
    this.listOfDisplayIntegrationWorkOrderConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data 
  }

  ngOnInit(): void {
    this.initSearchForm();
    this.searching = false;
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });
  }
}
