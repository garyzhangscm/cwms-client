import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';


import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationItemUnitOfMeasureData } from '../models/integration-item-unit-of-measure-data';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationItemUnitOfMeasureDataService } from '../services/integration-item-unit-of-measure-data.service';

@Component({
    selector: 'app-integration-integration-data-item-unit-of-measure',
    templateUrl: './integration-data-item-unit-of-measure.component.html',
    styleUrls: ['./integration-data-item-unit-of-measure.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataItemUnitOfMeasureComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<IntegrationItemUnitOfMeasureData>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.id - b.id,
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
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.itemId - b.itemId, 
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
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.itemName.localeCompare(b.itemName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
    
        {
          name: 'item-package-type-id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.itemPackageTypeId - b.itemPackageTypeId, 
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'item-package-type-name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.itemPackageTypeName.localeCompare(b.itemPackageTypeName),
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
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.unitOfMeasureId - b.unitOfMeasureId,
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
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.unitOfMeasureName.localeCompare(b.unitOfMeasureName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },

        {
          name: 'quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.quantity - b.quantity,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'weight',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.weight - b.weight,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'length',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.length - b.length,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'width',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.width - b.width,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'height',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.height - b.height,
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
          sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData)  => a.warehouseId - b.warehouseId,
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
      sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.warehouseName.localeCompare(b.warehouseName),
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
              sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => a.status.localeCompare(b.status),
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
              sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => differenceInMilliseconds(b.insertTime, a.insertTime),
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
              sortFn: (a: IntegrationItemUnitOfMeasureData, b: IntegrationItemUnitOfMeasureData) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
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
  listOfAllIntegrationItemUnitOfMeasureData: IntegrationItemUnitOfMeasureData[] = [];
  listOfDisplayIntegrationItemUnitOfMeasureData: IntegrationItemUnitOfMeasureData[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private integrationItemUnitOfMeasureDataService: IntegrationItemUnitOfMeasureDataService, 
    private utilService: UtilService,
    private messageService: NzMessageService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemUnitOfMeasureData = [];
    this.listOfDisplayIntegrationItemUnitOfMeasureData = [];
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
    this.integrationItemUnitOfMeasureDataService.getData(startTime, endTime, specificDate, 
      this.searchForm.value.statusList.value,
      this.searchForm.value.id.value,).subscribe(
      integrationItemUnitOfMeasureDataRes => {
        this.listOfAllIntegrationItemUnitOfMeasureData = integrationItemUnitOfMeasureDataRes;
        this.listOfDisplayIntegrationItemUnitOfMeasureData = integrationItemUnitOfMeasureDataRes;
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemUnitOfMeasureDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationItemUnitOfMeasureData[]): void {
    this.listOfDisplayIntegrationItemUnitOfMeasureData = $event;
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
      integrationDateTimeRanger: [null],
      integrationDate: [null],
      statusList: [null],
      id: [null]
    });
  }
  
  resendIntegration(id: number) : void {
    this.integrationItemUnitOfMeasureDataService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
