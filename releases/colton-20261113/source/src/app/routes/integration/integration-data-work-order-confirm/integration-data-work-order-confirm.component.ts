import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationWorkOrderConfirmation } from '../models/integration-work-order-confirmation';
import { IntegrationWorkOrderConfirmationService } from '../services/integration-work-order-confirmation.service';

@Component({
    selector: 'app-integration-integration-data-work-order-confirm',
    templateUrl: './integration-data-work-order-confirm.component.html',
    styleUrls: ['./integration-data-work-order-confirm.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataWorkOrderConfirmComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  listOfColumns: Array<ColumnItem<IntegrationWorkOrderConfirmation>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.id - b.id,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.number.localeCompare(b.number),
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
              sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation)  => a.warehouseId - b.warehouseId,
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
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.warehouseName.localeCompare(b.warehouseName),
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
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.itemId - b.itemId, 
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
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.itemName.localeCompare(b.itemName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'production-line.name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.productionLineName.localeCompare(b.productionLineName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'bill-of-material.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.billOfMaterialName.localeCompare(b.billOfMaterialName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'work-order.expected-quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.expectedQuantity - b.expectedQuantity, 
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'work-order.produced-quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.producedQuantity - b.producedQuantity,
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
                  sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.status.localeCompare(b.status),
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
                  sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => differenceInMilliseconds(b.createdTime, a.createdTime),
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
                  sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => differenceInMilliseconds(b.lastModifiedTime, a.lastModifiedTime),
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
  listOfAllIntegrationWorkOrderConfirmations: IntegrationWorkOrderConfirmation[] = [];
  listOfDisplayIntegrationWorkOrderConfirmations: IntegrationWorkOrderConfirmation[] = []; 

  isCollapse = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);
 
  constructor(
    private fb: UntypedFormBuilder,
    private integrationWorkOrderConfirmationService: IntegrationWorkOrderConfirmationService, 
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationWorkOrderConfirmations = [];
    this.listOfDisplayIntegrationWorkOrderConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.isSpinning = true;

    let startTime : Date = this.searchForm.value.integrationDateTimeRanger ? 
        this.searchForm.value.integrationDateTimeRanger[0] : undefined; 
    let endTime : Date = this.searchForm.value.integrationDateTimeRanger ? 
        this.searchForm.value.integrationDateTimeRanger[1] : undefined; 
    let specificDate : Date = this.searchForm.value.integrationDate;
	
    this.integrationWorkOrderConfirmationService.getData(startTime, endTime, specificDate,
      this.searchForm.value.statusList,
      this.searchForm.value.id,).subscribe(
      integrationWorkOrderConfirmationRes => {
        console.log(`integrationOrderConfirmationRes:${JSON.stringify(integrationWorkOrderConfirmationRes)}`);
        this.listOfAllIntegrationWorkOrderConfirmations = integrationWorkOrderConfirmationRes;
        this.listOfDisplayIntegrationWorkOrderConfirmations = integrationWorkOrderConfirmationRes;

        this.searching = false;
        this.isSpinning = false;
      
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationWorkOrderConfirmationRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
      
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationWorkOrderConfirmation[]): void {
    this.listOfDisplayIntegrationWorkOrderConfirmations = $event;
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
    this.searching = false;
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
    this.integrationWorkOrderConfirmationService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
