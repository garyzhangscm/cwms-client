import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationItemData } from '../models/integration-item-data';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationItemDataService } from '../services/integration-item-data.service';

@Component({
    selector: 'app-integration-integration-data-item',
    templateUrl: './integration-data-item.component.html',
    styleUrls: ['./integration-data-item.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataItemComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  listOfColumns: Array<ColumnItem<IntegrationItemData>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.id - b.id,
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
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.name.localeCompare(b.name),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            
            {
              name: 'item.description',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.description.localeCompare(b.description),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },

            {
              name: 'client.id',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.clientId - b.clientId,
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
                  name: 'client.name',
                  showSort: true,
                  sortOrder: null,
                  sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.clientName.localeCompare(b.clientName),
                  sortDirections: ['ascend', 'descend'],
                  filterMultiple: true,
                  listOfFilter: [],
                  filterFn: null, 
                  showFilter: false
                }, 

                {
                  name: 'item.item-family',
                  showSort: true,
                  sortOrder: null,
                  sortFn: (a: IntegrationItemData, b: IntegrationItemData) => this.utilService.compareNullableObjField(a.itemFamily, b.itemFamily, 'name'),
                  sortDirections: ['ascend', 'descend'],
                  filterMultiple: true,
                  listOfFilter: [],
                  filterFn: null, 
                  showFilter: false
                },
                
                {
                  name: 'unit-cost',
                  showSort: true,
                  sortOrder: null,
                  sortFn: (a: IntegrationItemData, b: IntegrationItemData) => this.utilService.compareNullableNumber(a.unitCost, b.unitCost),
                  sortDirections: ['ascend', 'descend'],
                  filterMultiple: true,
                  listOfFilter: [],
                  filterFn: null, 
                  showFilter: false
                },
    {
          name: 'warehouse.id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemData, b: IntegrationItemData)  => a.warehouseId - b.warehouseId,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        
    {
      name: 'warehouse.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.warehouseName.localeCompare(b.warehouseName),
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
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.status.localeCompare(b.status),
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
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => differenceInMilliseconds(b.insertTime, a.insertTime),
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
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
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
  searchResult = '';
  expandSet = new Set<number>();
  isSpinning = false;

  // Table data for display
  listOfAllIntegrationItemData: IntegrationItemData[] = [];
  listOfDisplayIntegrationItemData: IntegrationItemData[] = []; 

  isCollapse = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);
  

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private integrationItemDataService: IntegrationItemDataService, 
    private utilService: UtilService,
    private messageService: NzMessageService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemData = [];
    this.listOfDisplayIntegrationItemData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.isSpinning = true;

    let startTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.integrationDate.value;
	
    this.integrationItemDataService.getData(startTime, endTime, specificDate, 
      this.searchForm.value.statusList.value,
      this.searchForm.value.id.value,).subscribe(
      integrationItemDataRes => {
        console.log(`integrationItemDataRes:\n${JSON.stringify(integrationItemDataRes)}`);
        this.listOfAllIntegrationItemData = integrationItemDataRes;
        this.listOfDisplayIntegrationItemData = integrationItemDataRes;
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemData[]): void {
    this.listOfDisplayIntegrationItemData = $event;
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
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
  
  resendIntegration(id: number) : void {
    this.integrationItemDataService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
