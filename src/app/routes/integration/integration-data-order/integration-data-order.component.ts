import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationOrder } from '../models/integration-order'; 
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationOrderService } from '../services/integration-order.service';

@Component({
    selector: 'app-integration-integration-data-order',
    templateUrl: './integration-data-order.component.html',
    styleUrls: ['./integration-data-order.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataOrderComponent implements OnInit {
  listOfColumns: Array<ColumnItem<IntegrationOrder>> = [    
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
                  sortFn: (a: IntegrationOrder, b: IntegrationOrder) => differenceInMilliseconds(b.insertTime, a.insertTime),
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
                  sortFn: (a: IntegrationOrder, b: IntegrationOrder) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
                  sortDirections: ['ascend', 'descend'],
                  filterMultiple: true,
                  listOfFilter: [],
                  filterFn: null, 
                  showFilter: false
                }, 
        ];
        expandSet = new Set<number>();

  searchForm!: UntypedFormGroup;

  searching = false;
  isSpinning = false;
  
  searchResult = '';

  // Table data for display
  listOfAllIntegrationOrders: IntegrationOrder[] = [];
  listOfDisplayIntegrationOrders: IntegrationOrder[] = []; 

  isCollapse = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);
 

  constructor(
    private fb: UntypedFormBuilder,
    private integrationOrderService: IntegrationOrderService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private utilService: UtilService,
    private messageService: NzMessageService,
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
    this.isSpinning = true;

    let startTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.integrationDate.value;
    this.integrationOrderService.getData(startTime, endTime, specificDate, 
      this.searchForm.value.statusList.value,
      this.searchForm.value.id.value,).subscribe(
      integrationOrderRes => {
        this.listOfAllIntegrationOrders = integrationOrderRes;
        this.listOfDisplayIntegrationOrders = integrationOrderRes;
 
         
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationOrderRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
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
      statusList: [null],
      id: [null]
    });
  }
  
  resendIntegration(id: number) : void {
    this.integrationOrderService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
