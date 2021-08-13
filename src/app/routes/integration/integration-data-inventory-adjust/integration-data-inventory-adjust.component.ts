import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationInventoryAdjustmentConfirmation } from '../models/integration-inventory-adjustment-confirmation';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { IntegrationInventoryAdjustmentConfirmationService } from '../services/integration-inventory-adjustment-confirmation.service';

@Component({
  selector: 'app-integration-integration-data-inventory-adjust',
  templateUrl: './integration-data-inventory-adjust.component.html',
  styleUrls: ['./integration-data-inventory-adjust.component.less'],
})
export class IntegrationIntegrationDataInventoryAdjustComponent implements OnInit {

  listOfColumns: ColumnItem[] = [    
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
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
              sortFn: (a: IntegrationInventoryAdjustmentConfirmation, b: IntegrationInventoryAdjustmentConfirmation) => a.errorMessage.localeCompare(b.errorMessage),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
        ];

  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationInventoryAdjustmentConfirmations: IntegrationInventoryAdjustmentConfirmation[] = [];
  listOfDisplayIntegrationInventoryAdjustmentConfirmations: IntegrationInventoryAdjustmentConfirmation[] = []; 
  isCollapse = false;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private integrationInventoryAdjustmentConfirmationService: IntegrationInventoryAdjustmentConfirmationService,
    private i18n: I18NService,
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
    this.searching = true;
    this.searchResult = '';
    this.integrationInventoryAdjustmentConfirmationService
      .getData()
      .subscribe(integrationInventoryAdjustmentConfirmationRes => {
        this.listOfAllIntegrationInventoryAdjustmentConfirmations = integrationInventoryAdjustmentConfirmationRes;
        this.listOfDisplayIntegrationInventoryAdjustmentConfirmations = integrationInventoryAdjustmentConfirmationRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationInventoryAdjustmentConfirmationRes.length,
        });
      });
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
    });
  }
}
