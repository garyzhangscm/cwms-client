import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationReceipt } from '../models/integration-receipt';
import { IntegrationReceiptConfirmation } from '../models/integration-receipt-confirmation';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationReceiptConfirmationService } from '../services/integration-receipt-confirmation.service';

@Component({
  selector: 'app-integration-integration-data-receipt-confirm',
  templateUrl: './integration-data-receipt-confirm.component.html',
  styleUrls: ['./integration-data-receipt-confirm.component.less'],
})
export class IntegrationIntegrationDataReceiptConfirmComponent implements OnInit {
  listOfColumns: Array<ColumnItem<IntegrationReceiptConfirmation>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => a.id - b.id,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'receipt.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => a.number.localeCompare(b.number),
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
              sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation)  => a.warehouseId - b.warehouseId,
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
          sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => a.warehouseName.localeCompare(b.warehouseName),
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
              sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation)  => a.clientId - b.clientId,
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
          sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => a.clientName.localeCompare(b.clientName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, 
        {
              name: 'supplier.id',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation)  => a.supplierId - b.supplierId,
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            
        {
          name: 'supplier.name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => a.supplierName.localeCompare(b.supplierName),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'receipt.allowUnexpectedItem',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => this.utilService.compareBoolean(a.allowUnexpectedItem, b.allowUnexpectedItem),
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
                  sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => a.status.localeCompare(b.status),
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
                  sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => differenceInMilliseconds(b.createdTime, a.createdTime),
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
                  sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => differenceInMilliseconds(b.lastModifiedTime, a.lastModifiedTime),
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
  searchResult = '';

  // Table data for display
  listOfAllIntegrationReceiptConfirmations: IntegrationReceiptConfirmation[] = [];
  listOfDisplayIntegrationReceiptConfirmations: IntegrationReceiptConfirmation[] = []; 

  isCollapse = false;
  isSpinning = false;
  integrationStatusList = IntegrationStatus;
 

  constructor(
    private fb: UntypedFormBuilder,
    private integrationReceiptConfirmationService: IntegrationReceiptConfirmationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {}

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationReceiptConfirmations = [];
    this.listOfDisplayIntegrationReceiptConfirmations = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.isSpinning = true;

    let startTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.integrationDate.value;
    this.integrationReceiptConfirmationService.getData(startTime, endTime, specificDate,
      this.searchForm.controls.statusList.value,
      this.searchForm.controls.id.value,).subscribe(
      integrationReceiptConfirmationRes => {
        this.listOfAllIntegrationReceiptConfirmations = integrationReceiptConfirmationRes;
        this.listOfDisplayIntegrationReceiptConfirmations = integrationReceiptConfirmationRes;

        this.searching = false;
        this.isSpinning = false;
      
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationReceiptConfirmationRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
      
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationReceiptConfirmation[]): void {
    this.listOfDisplayIntegrationReceiptConfirmations = $event;
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
    this.integrationReceiptConfirmationService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
