import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationItemFamilyData } from '../models/integration-item-family-data';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationItemFamilyDataService } from '../services/integration-item-family-data.service';

@Component({
  selector: 'app-integration-integration-data-item-family',
  templateUrl: './integration-data-item-family.component.html',
  styleUrls: ['./integration-data-item-family.component.less'],
})
export class IntegrationIntegrationDataItemFamilyComponent implements OnInit {
  listOfColumns: Array<ColumnItem<IntegrationItemFamilyData>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => a.id - b.id,
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => a.name.localeCompare(b.name),
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => a.description.localeCompare(b.description),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'warehouse-id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => a.warehouseId - b.warehouseId,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'warehouse-name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => a.warehouseName.localeCompare(b.warehouseName),
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => a.status.localeCompare(b.status),
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => differenceInMilliseconds(b.insertTime, a.insertTime),
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, 
        ];
        

  // Form related data and functions
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  isSpinning = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationItemFamilyData: IntegrationItemFamilyData[] = [];
  listOfDisplayIntegrationItemFamilyData: IntegrationItemFamilyData[] = []; 

  isCollapse = false; 
  integrationStatusList = IntegrationStatus;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private integrationItemFamilyDataService: IntegrationItemFamilyDataService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private utilService: UtilService,
    private messageService: NzMessageService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemFamilyData = [];
    this.listOfDisplayIntegrationItemFamilyData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.isSpinning = true;

    let startTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.integrationDate.value;
    this.integrationItemFamilyDataService.getData(startTime, endTime, specificDate, 
      this.searchForm.controls.statusList.value,
      this.searchForm.controls.id.value,).subscribe(
      integrationItemFamilyDataRes => {
        this.listOfAllIntegrationItemFamilyData = integrationItemFamilyDataRes;
        this.listOfDisplayIntegrationItemFamilyData = integrationItemFamilyDataRes;
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemFamilyDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemFamilyData[]): void {
    this.listOfDisplayIntegrationItemFamilyData = $event;
  }
   

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      integrationDateTimeRanger: [null],
      integrationDate: [null],
      statusList: [null],
      id: [null]
    });
  }

  
  resendIntegration(id: number) : void {
    this.integrationItemFamilyDataService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
