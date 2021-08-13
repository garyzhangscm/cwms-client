import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme'; 
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationOrder } from '../models/integration-order'; 
import { IntegrationOrderService } from '../services/integration-order.service';

@Component({
  selector: 'app-integration-integration-data-order',
  templateUrl: './integration-data-order.component.html',
  styleUrls: ['./integration-data-order.component.less'],
})
export class IntegrationIntegrationDataOrderComponent implements OnInit {
  listOfColumns: ColumnItem[] = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationOrder, b: IntegrationOrder) => a.id - b.id,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'order.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationOrder, b: IntegrationOrder) => a.number.localeCompare(b.number),
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
              sortFn: (a: IntegrationOrder, b: IntegrationOrder)  => a.warehouseId - b.warehouseId,
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
          sortFn: (a: IntegrationOrder, b: IntegrationOrder) => a.warehouseName.localeCompare(b.warehouseName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, 
        {
          name: 'shipToCustomer',
          showSort: false,
          sortOrder: null,
          sortFn: null,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },  
        {
          name: 'order.billToCustomer',
          showSort: false,
          sortOrder: null,
          sortFn: null,
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
                  sortFn: (a: IntegrationOrder, b: IntegrationOrder) => a.status.localeCompare(b.status),
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
                  sortFn: (a: IntegrationOrder, b: IntegrationOrder) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
                  sortFn: (a: IntegrationOrder, b: IntegrationOrder) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
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
                  sortFn: (a: IntegrationOrder, b: IntegrationOrder) => a.errorMessage.localeCompare(b.errorMessage),
                  sortDirections: ['ascend', 'descend'],
                  filterMultiple: true,
                  listOfFilter: [],
                  filterFn: null, 
                  showFilter: false
                },
        ];
        expandSet = new Set<number>();

  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationOrders: IntegrationOrder[] = [];
  listOfDisplayIntegrationOrders: IntegrationOrder[] = []; 

  isCollapse = false;
 

  constructor(
    private fb: FormBuilder,
    private integrationOrderService: IntegrationOrderService,
    private i18n: I18NService,
    private utilService: UtilService,
  ) {}
  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationOrders = [];
    this.listOfDisplayIntegrationOrders = [];
 
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationOrderService.getData().subscribe(
      integrationOrderRes => {
        this.listOfAllIntegrationOrders = integrationOrderRes;
        this.listOfDisplayIntegrationOrders = integrationOrderRes;
 
         
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationOrderRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationOrder[]): void {
    this.listOfDisplayIntegrationOrders = $event;
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
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
