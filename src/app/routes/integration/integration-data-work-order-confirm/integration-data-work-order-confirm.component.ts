import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationOrderConfirmation } from '../models/integration-order-confirmation';
import { IntegrationWorkOrderConfirmation } from '../models/integration-work-order-confirmation';
import { IntegrationWorkOrderConfirmationService } from '../services/integration-work-order-confirmation.service';

@Component({
  selector: 'app-integration-integration-data-work-order-confirm',
  templateUrl: './integration-data-work-order-confirm.component.html',
  styleUrls: ['./integration-data-work-order-confirm.component.less'],
})
export class IntegrationIntegrationDataWorkOrderConfirmComponent implements OnInit {

  
  listOfColumns: ColumnItem[] = [    
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
                  sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
                  sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
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
                  sortFn: (a: IntegrationWorkOrderConfirmation, b: IntegrationWorkOrderConfirmation) => a.errorMessage.localeCompare(b.errorMessage),
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
  isSpinning = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationWorkOrderConfirmations: IntegrationWorkOrderConfirmation[] = [];
  listOfDisplayIntegrationWorkOrderConfirmations: IntegrationWorkOrderConfirmation[] = []; 

  isCollapse = false;
 
  constructor(
    private fb: FormBuilder,
    private integrationWorkOrderConfirmationService: IntegrationWorkOrderConfirmationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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

    let startTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.integrationDate.value;
	
    this.integrationWorkOrderConfirmationService.getData(startTime, endTime, specificDate).subscribe(
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
    });
  }
}
