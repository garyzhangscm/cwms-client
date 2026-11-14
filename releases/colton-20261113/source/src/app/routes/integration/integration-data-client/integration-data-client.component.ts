import { formatDate } from '@angular/common';
import { Component, inject, OnInit,  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationClientData } from '../models/integration-client-data';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationClientDataService } from '../services/integration-client-data.service';

@Component({
    selector: 'app-integration-integration-data-client',
    templateUrl: './integration-data-client.component.html',
    styleUrls: ['./integration-data-client.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataClientComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<IntegrationClientData>> = [    
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
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => differenceInMilliseconds(b.insertTime, a.insertTime),
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
              sortFn: (a: IntegrationClientData, b: IntegrationClientData) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
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
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationClientData: IntegrationClientData[] = [];
  listOfDisplayIntegrationClientData: IntegrationClientData[] = []; 

  isCollapse = false;
  
  isSpinning = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);


  integrationDataModal!: NzModalRef;
  integrationDataForm!: UntypedFormGroup;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private integrationClientDataService: IntegrationClientDataService,
    private clientService: ClientService, 
    private modalService: NzModalService,
    private utilService: UtilService,
    private messageService: NzMessageService,
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
    
    let startTime : Date = this.searchForm.value.integrationDateTimeRanger ? 
        this.searchForm.value.integrationDateTimeRanger[0] : undefined; 
    let endTime : Date = this.searchForm.value.integrationDateTimeRanger ? 
        this.searchForm.value.integrationDateTimeRanger[1] : undefined; 
    let specificDate : Date = this.searchForm.value.integrationDate;

    this.integrationClientDataService.getData(startTime, endTime, specificDate, 
      this.searchForm.value.statusList,
      this.searchForm.value.id,
      
      ).subscribe(
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
      
      statusList: [null],
      id: [null]
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id!.toString() }));
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

  resendIntegration(id: number) : void {
    this.integrationClientDataService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
