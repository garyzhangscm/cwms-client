import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationOrderConfirmationService } from '../services/integration-order-confirmation.service';

@Component({
    selector: 'app-integration-integration-data-order-confirm',
    templateUrl: './integration-data-order-confirm.component.html',
    styleUrls: ['./integration-data-order-confirm.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataOrderConfirmComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<IntegrationOrderConfirmation>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationOrderConfirmation, b: IntegrationOrderConfirmation) => a.id - b.id,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'order.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationOrderConfirmation, b: IntegrationOrderConfirmation) => a.number.localeCompare(b.number),
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
              sortFn: (a: IntegrationOrderConfirmation, b: IntegrationOrderConfirmation)  => a.warehouseId - b.warehouseId,
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
          sortFn: (a: IntegrationOrderConfirmation, b: IntegrationOrderConfirmation) => a.warehouseName.localeCompare(b.warehouseName),
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
                  sortFn: (a: IntegrationOrderConfirmation, b: IntegrationOrderConfirmation) => a.status.localeCompare(b.status),
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
                  sortFn: (a: IntegrationOrderConfirmation, b: IntegrationOrderConfirmation) => differenceInMilliseconds(b.createdTime, a.createdTime),
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
                  sortFn: (a: IntegrationOrderConfirmation, b: IntegrationOrderConfirmation) => differenceInMilliseconds(b.lastModifiedTime, a.lastModifiedTime),
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
  listOfAllIntegrationOrderConfirmations: IntegrationOrderConfirmation[] = [];
  listOfDisplayIntegrationOrderConfirmations: IntegrationOrderConfirmation[] = []; 
  isCollapse = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);
 
  constructor(
    private fb: UntypedFormBuilder,
    private integrationOrderConfirmationService: IntegrationOrderConfirmationService, 
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationOrderConfirmations = [];
    this.listOfDisplayIntegrationOrderConfirmations = [];
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
    this.integrationOrderConfirmationService.getData(startTime, endTime, specificDate,
      this.searchForm.value.statusList,
      this.searchForm.value.id,).subscribe(
      integrationOrderConfirmationRes => {
        console.log(`integrationOrderConfirmationRes:${JSON.stringify(integrationOrderConfirmationRes)}`);
        this.listOfAllIntegrationOrderConfirmations = integrationOrderConfirmationRes;
        this.listOfDisplayIntegrationOrderConfirmations = integrationOrderConfirmationRes;

        this.searching = false;
        this.isSpinning = false;
      
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationOrderConfirmationRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
      
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationOrderConfirmation[]): void {
    this.listOfDisplayIntegrationOrderConfirmations = $event;
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
    this.integrationOrderConfirmationService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
