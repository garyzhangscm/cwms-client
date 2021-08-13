import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationItemFamilyData } from '../models/integration-item-family-data';
import { IntegrationItemFamilyDataService } from '../services/integration-item-family-data.service';

@Component({
  selector: 'app-integration-integration-data-item-family',
  templateUrl: './integration-data-item-family.component.html',
  styleUrls: ['./integration-data-item-family.component.less'],
})
export class IntegrationIntegrationDataItemFamilyComponent implements OnInit {
  listOfColumns: ColumnItem[] = [    
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
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
          sortFn: (a: IntegrationItemFamilyData, b: IntegrationItemFamilyData) => a.errorMessage.localeCompare(b.errorMessage),
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

  // Table data for display
  listOfAllIntegrationItemFamilyData: IntegrationItemFamilyData[] = [];
  listOfDisplayIntegrationItemFamilyData: IntegrationItemFamilyData[] = []; 

  isCollapse = false; 

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationItemFamilyDataService: IntegrationItemFamilyDataService,
    private i18n: I18NService,
    private utilService: UtilService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationItemFamilyData = [];
    this.listOfDisplayIntegrationItemFamilyData = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationItemFamilyDataService.getItemFamilyData().subscribe(
      integrationItemFamilyDataRes => {
        this.listOfAllIntegrationItemFamilyData = integrationItemFamilyDataRes;
        this.listOfDisplayIntegrationItemFamilyData = integrationItemFamilyDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationItemFamilyDataRes.length,
        });
      },
      () => {
        this.searching = false;
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
    });
  }
}
