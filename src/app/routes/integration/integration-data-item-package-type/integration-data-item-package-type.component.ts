import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationItemPackageTypeData } from '../models/integration-item-package-type-data';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationItemPackageTypeDataService } from '../services/integration-item-package-type-data.service';

@Component({
    selector: 'app-integration-integration-data-item-package-type',
    templateUrl: './integration-data-item-package-type.component.html',
    styleUrls: ['./integration-data-item-package-type.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataItemPackageTypeComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<IntegrationItemPackageTypeData>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.id - b.id,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
    
        {
          name: 'item.id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.itemId - b.itemId, 
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'item.name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.itemName.localeCompare(b.itemName),
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
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.name.localeCompare(b.name),
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
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.description.localeCompare(b.description),
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
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.clientId - b.clientId,
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
              sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.clientName.localeCompare(b.clientName),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            
        {
          name: 'supplier-id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.supplierId - b.supplierId,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
              name: 'supplier-name',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.supplierName.localeCompare(b.supplierName),
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
          sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData)  => a.warehouseId - b.warehouseId,
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
      sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.warehouseName.localeCompare(b.warehouseName),
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
              sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => a.status.localeCompare(b.status),
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
              sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => differenceInMilliseconds(b.insertTime, a.insertTime),
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
              sortFn: (a: IntegrationItemPackageTypeData, b: IntegrationItemPackageTypeData) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            }, 
        ];
        expandSet = new Set<number>();

  // Form related data and functions
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  isSpinning = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationItemPackageTypeData: IntegrationItemPackageTypeData[] = [];
  listOfDisplayIntegrationItemPackageTypeData: IntegrationItemPackageTypeData[] = []; 

  isCollapse = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);
 

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private integrationItemPackageTypeDataService: IntegrationItemPackageTypeDataService, 
    private utilService: UtilService,
    private messageService: NzMessageService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemPackageTypeData = [];
    this.listOfDisplayIntegrationItemPackageTypeData = [];
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
    this.integrationItemPackageTypeDataService.getData(startTime, endTime, specificDate, 
      this.searchForm.value.statusList.value,
      this.searchForm.value.id.value,).subscribe(
      integrationItemPackageTypeDataRes => {
        this.listOfAllIntegrationItemPackageTypeData = integrationItemPackageTypeDataRes;
        this.listOfDisplayIntegrationItemPackageTypeData = integrationItemPackageTypeDataRes;
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemPackageTypeDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemPackageTypeData[]): void {
    this.listOfDisplayIntegrationItemPackageTypeData = $event;
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
    this.integrationItemPackageTypeDataService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
