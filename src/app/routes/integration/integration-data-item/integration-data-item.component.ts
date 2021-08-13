import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationItemData } from '../models/integration-item-data';
import { IntegrationItemDataService } from '../services/integration-item-data.service';

@Component({
  selector: 'app-integration-integration-data-item',
  templateUrl: './integration-data-item.component.html',
  styleUrls: ['./integration-data-item.component.less'],
})
export class IntegrationIntegrationDataItemComponent implements OnInit {

  listOfColumns: ColumnItem[] = [    
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
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
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
              sortFn: (a: IntegrationItemData, b: IntegrationItemData) => a.errorMessage.localeCompare(b.errorMessage),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
        ];
  // Form related data and functions
  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';
  expandSet = new Set<number>();

  // Table data for display
  listOfAllIntegrationItemData: IntegrationItemData[] = [];
  listOfDisplayIntegrationItemData: IntegrationItemData[] = []; 

  isCollapse = false;

  

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationItemDataService: IntegrationItemDataService,
    private i18n: I18NService,
    private utilService: UtilService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemData = [];
    this.listOfDisplayIntegrationItemData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationItemDataService.getItemData().subscribe(
      integrationItemDataRes => {
        console.log(`integrationItemDataRes:\n${JSON.stringify(integrationItemDataRes)}`);
        this.listOfAllIntegrationItemData = integrationItemDataRes;
        this.listOfDisplayIntegrationItemData = integrationItemDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemDataRes.length,
        });
      },
      () => {
        this.searching = false;
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
    });
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
}
