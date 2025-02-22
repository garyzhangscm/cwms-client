import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationInventoryAdjustmentConfirmation } from '../models/integration-inventory-adjustment-confirmation';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationInventoryAdjustmentConfirmationService } from '../services/integration-inventory-adjustment-confirmation.service';

@Component({
    selector: 'app-integration-integration-data-inventory-adjust',
    templateUrl: './integration-data-inventory-adjust.component.html',
    styleUrls: ['./integration-data-inventory-adjust.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataInventoryAdjustComponent implements OnInit {

  listOfColumns: Array<ColumnItem<IntegrationInventoryAdjustmentConfirmation>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.id - b.id,
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
          sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation)  => a.warehouseId - b.warehouseId,
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
      sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.warehouseName.localeCompare(b.warehouseName),
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
          sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.clientId - b.clientId,
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.clientName.localeCompare(b.clientName),
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.itemId - b.itemId, 
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.itemName.localeCompare(b.itemName),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'inventory-status.id',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.inventoryStatusId - b.inventoryStatusId,
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'inventory-status.name',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.inventoryStatusName.localeCompare(b.inventoryStatusName),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'adjustQuantity',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.adjustQuantity - b.adjustQuantity,
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.status.localeCompare(b.status),
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => differenceInMilliseconds(b.createdTime, a.createdTime),
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => differenceInMilliseconds(b.lastModifiedTime, a.lastModifiedTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            }, 
        ];

  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';
  isSpinning = false;

  // Table data for display
  listOfAllIntegrationInventoryAdjustmentConfirmations: IntegrationInventoryAdjustmentConfirmation[] = [];
  listOfDisplayIntegrationInventoryAdjustmentConfirmations: IntegrationInventoryAdjustmentConfirmation[] = []; 
  isCollapse = false;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);

  constructor(
    private fb: UntypedFormBuilder,
    private integrationInventoryAdjustmentConfirmationService: IntegrationInventoryAdjustmentConfirmationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationInventoryAdjustmentConfirmations = [];
    this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = [];
  }
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    let startTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.integrationDate.value;
    
    this.integrationInventoryAdjustmentConfirmationService
      .getData( startTime,
        endTime, 
        specificDate,
        this.searchForm.value.statusList.value,
        this.searchForm.value.id.value,
         )
      .subscribe(integrationInventoryAdjustmentConfirmationRes => {
        this.listOfAllIntegrationInventoryAdjustmentConfirmations = integrationInventoryAdjustmentConfirmationRes;
        this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = integrationInventoryAdjustmentConfirmationRes;

        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationInventoryAdjustmentConfirmationRes.length,
        });
      }, 
      () =>  this.isSpinning = false);
  }

  currentPageDataChange($event: IntegrationInventoryAdjustmentConfirmation[]): void {
    this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = $event;
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
    this.integrationInventoryAdjustmentConfirmationService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
