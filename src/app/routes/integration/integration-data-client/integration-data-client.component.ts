import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { IntegrationClientData } from '../models/integration-client-data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationClientDataService } from '../services/integration-client-data.service';
import { ClientService } from '../../common/services/client.service';
import { I18NService } from '@core';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { Client } from '../../common/models/client';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-integration-integration-data-client',
  templateUrl: './integration-data-client.component.html',
  styleUrls: ['./integration-data-client.component.less'],
})
export class IntegrationIntegrationDataClientComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationClientData: IntegrationClientData[] = [];
  listOfDisplayIntegrationClientData: IntegrationClientData[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  integrationDataModal: NzModalRef;
  integrationDataForm: FormGroup;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationClientDataService: IntegrationClientDataService,
    private clientService: ClientService,

    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationClientData = [];
    this.listOfDisplayIntegrationClientData = [];
  }
  search(integrationClientDataId?: number): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationClientDataService.getClientData(integrationClientDataId).subscribe(
      integrationClientDataRes => {
        this.listOfAllIntegrationClientData = integrationClientDataRes;
        this.listOfDisplayIntegrationClientData = integrationClientDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationClientDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationClientData[]): void {
    this.listOfDisplayIntegrationClientData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationClientData = this.listOfAllIntegrationClientData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationClientData = this.listOfAllIntegrationClientData;
    }
  }

  ngOnInit() {
    this.initSearchForm();
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],

      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
    });
  }

  openAddIntegrationDataModal(
    tplIntegrationDataModalTitle: TemplateRef<{}>,
    tplIntegrationDataModalContent: TemplateRef<{}>,
  ) {
    this.integrationDataForm = this.fb.group({
      name: [null],
      description: [null],
      contactorFirstname: [null],
      contactorLastname: [null],
      addressCountry: [null],
      addressState: [null],
      addressCounty: [null],
      addressCity: [null],
      addressDistrict: [null],
      addressLine1: [null],
      addressLine2: [null],
      addressPostcode: [null],
    });

    this.integrationDataModal = this.modalService.create({
      nzTitle: tplIntegrationDataModalTitle,
      nzContent: tplIntegrationDataModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.integrationDataModal.destroy();
      },
      nzOnOk: () => {
        this.createIntegrationData(this.integrationDataForm.value);
      },

      nzWidth: 1000,
    });
  }
  createIntegrationData(clientData: IntegrationClientData) {
    console.log(`start to add integration data: ${JSON.stringify(clientData)}`);

    this.integrationClientDataService.addClientData(clientData).subscribe(integrationClientDataRes => {
      this.search(integrationClientDataRes.id);
    });
  }
}
