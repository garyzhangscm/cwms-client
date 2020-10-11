import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { IntegrationClientData } from '../models/integration-client-data';
import { IntegrationClientDataService } from '../services/integration-client-data.service';

@Component({
  selector: 'app-integration-integration-data-client',
  templateUrl: './integration-data-client.component.html',
  styleUrls: ['./integration-data-client.component.less'],
})
export class IntegrationIntegrationDataClientComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  // Form related data and functions
  searchForm!: FormGroup;

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

  integrationDataModal!: NzModalRef;
  integrationDataForm!: FormGroup;

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
    
  }

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm(): void {
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
  ): void {
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
  createIntegrationData(clientData: IntegrationClientData): void{
    console.log(`start to add integration data: ${JSON.stringify(clientData)}`);

    this.integrationClientDataService.addClientData(clientData).subscribe(integrationClientDataRes => {
      this.search(integrationClientDataRes.id);
    });
  }
}
