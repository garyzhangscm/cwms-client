import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationReceipt } from '../models/integration-receipt';
import { IntegrationReceiptConfirmation } from '../models/integration-receipt-confirmation';
import { IntegrationReceiptConfirmationService } from '../services/integration-receipt-confirmation.service';

@Component({
  selector: 'app-integration-integration-data-receipt-confirm',
  templateUrl: './integration-data-receipt-confirm.component.html',
  styleUrls: ['./integration-data-receipt-confirm.component.less'],
})
export class IntegrationIntegrationDataReceiptConfirmComponent implements OnInit {
  listOfColumns: ColumnItem[] = [    
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
                  sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
                  sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
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
                  sortFn: (a: IntegrationReceiptConfirmation, b: IntegrationReceiptConfirmation) => a.errorMessage.localeCompare(b.errorMessage),
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
  listOfAllIntegrationReceiptConfirmations: IntegrationReceiptConfirmation[] = [];
  listOfDisplayIntegrationReceiptConfirmations: IntegrationReceiptConfirmation[] = []; 

  isCollapse = false;
  isSpinning = false;
 

  constructor(
    private fb: FormBuilder,
    private integrationReceiptConfirmationService: IntegrationReceiptConfirmationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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
    this.integrationReceiptConfirmationService.getData(startTime, endTime, specificDate).subscribe(
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
    });
  }
}
