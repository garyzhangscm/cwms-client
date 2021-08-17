import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationClientData } from '../models/integration-client-data';
import { IntegrationClientDataService } from '../services/integration-client-data.service';

@Component({
  selector: 'app-integration-integration-data-client',
  templateUrl: './integration-data-client.component.html',
  styleUrls: ['./integration-data-client.component.less'],
})
export class IntegrationIntegrationDataClientComponent implements OnInit {
  listOfColumns: ColumnItem[] = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.id - b.id,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
    {
          name: 'name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.name.localeCompare(b.name),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        
    {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
          name: 'contactor.firstname',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.contactorFirstname.localeCompare(b.contactorFirstname),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
              name: 'contactor.lastname',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.contactorLastname.localeCompare(b.contactorLastname),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'country',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressCountry.localeCompare(b.addressCountry),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'state',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressState.localeCompare(b.addressState),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'county',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressCounty!.localeCompare(b.addressCounty!),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'city',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressCity.localeCompare(b.addressCity),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'district',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressDistrict!.localeCompare(b.addressDistrict!),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'line1',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressLine1.localeCompare(b.addressLine1),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'line2',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressLine2!.localeCompare(b.addressLine2!),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'postcode',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.addressPostcode.localeCompare(b.addressPostcode),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.status',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.status.localeCompare(b.status),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.insertTime',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.lastUpdateTime',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.errorMessage',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => a.errorMessage.localeCompare(b.errorMessage),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
        ];

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

  isCollapse = false;
  
  isSpinning = false;


  integrationDataModal!: NzModalRef;
  integrationDataForm!: FormGroup;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationClientDataService: IntegrationClientDataService,
    private clientService: ClientService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private utilService: UtilService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationClientData = [];
    this.listOfDisplayIntegrationClientData = [];
  }
  search(): void {
    this.searching = true;
    this.isSpinning = true;

    this.searchResult = '';
    
    let startTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.integrationDate.value;

    this.integrationClientDataService.getData(startTime, endTime, specificDate).subscribe(
      integrationClientDataRes => {
        this.listOfAllIntegrationClientData = integrationClientDataRes;
        this.listOfDisplayIntegrationClientData = integrationClientDataRes;
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationClientDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationClientData[]): void {
    this.listOfDisplayIntegrationClientData = $event;
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
/**
 * 
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
 */
}
