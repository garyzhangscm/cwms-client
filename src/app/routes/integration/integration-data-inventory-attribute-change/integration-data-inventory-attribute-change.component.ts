import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { IntegrationInventoryAttributeChangeConfirmation } from '../models/integration-inventory-attribute-change-confirmation';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationInventoryAttributeChangeConfirmationService } from '../services/integration-inventory-attribute-change-confirmation.service';

@Component({
    selector: 'app-integration-integration-data-inventory-attribute-change',
    templateUrl: './integration-data-inventory-attribute-change.component.html',
    styleUrls: ['./integration-data-inventory-attribute-change.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataInventoryAttributeChangeComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<IntegrationInventoryAttributeChangeConfirmation>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.id - b.id,
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
          sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation)  => a.warehouseId - b.warehouseId,
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
      sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.warehouseName.localeCompare(b.warehouseName),
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
          sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.clientId - b.clientId,
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.clientName.localeCompare(b.clientName),
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.itemId - b.itemId, 
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.itemName.localeCompare(b.itemName),
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.inventoryStatusId - b.inventoryStatusId,
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.inventoryStatusName.localeCompare(b.inventoryStatusName),
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.quantity - b.quantity,
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },   
            {
              name: 'attributeName',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.attributeName.localeCompare(b.attributeName),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },   
            {
              name: 'originalValue',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.originalValue.localeCompare(b.originalValue),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },   
            {
              name: 'newValue',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.newValue.localeCompare(b.newValue),
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.status.localeCompare(b.status),
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
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
              sortFn: (a: IntegrationInventoryAttributeChangeConfirmation, b: IntegrationInventoryAttributeChangeConfirmation) => a.errorMessage.localeCompare(b.errorMessage),
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

  // Table data for display
  listOfAllIntegrationInventoryAttributeChangeConfirmations: IntegrationInventoryAttributeChangeConfirmation[] = [];
  listOfDisplayIntegrationInventoryAttributeChangeConfirmations: IntegrationInventoryAttributeChangeConfirmation[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;
  isSpinning = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);
  

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  constructor(
    private fb: UntypedFormBuilder,
    private integrationInventoryAdjustmentConfirmationService: IntegrationInventoryAttributeChangeConfirmationService, 
    private utilService: UtilService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationInventoryAttributeChangeConfirmations = [];
    this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.isSpinning = true;

    let startTime : Date = this.searchForm.value.integrationDateTimeRanger ? 
        this.searchForm.value.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.integrationDateTimeRanger ? 
        this.searchForm.value.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.integrationDate;
    this.integrationInventoryAdjustmentConfirmationService.getData(startTime, endTime, specificDate,
      this.searchForm.value.statusList,
      this.searchForm.value.id,).subscribe(
      integrationInventoryAdjustmentConfirmationRes => {
        this.listOfAllIntegrationInventoryAttributeChangeConfirmations = integrationInventoryAdjustmentConfirmationRes;
        this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = integrationInventoryAdjustmentConfirmationRes;

        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationInventoryAdjustmentConfirmationRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationInventoryAttributeChangeConfirmation[]): void {
    this.listOfDisplayIntegrationInventoryAttributeChangeConfirmations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    
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
}
