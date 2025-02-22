import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UtilService } from '../../util/services/util.service';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationWorkOrder } from '../models/integration-work-order';
import { IntegrationWorkOrderDataService } from '../services/integration-work-order-data.service';

@Component({
    selector: 'app-integration-integration-data-work-order',
    templateUrl: './integration-data-work-order.component.html',
    styleUrls: ['./integration-data-work-order.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataWorkOrderComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  searchForm!: UntypedFormGroup;

  searching = false;
  isSpinning = false;
  
  searchResult = '';

  // Table data for display
  listOfAllIntegrationWorkOrders: IntegrationWorkOrder[] = []; 

  isCollapse = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);
 

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("id"),  index: 'id' , iif: () => this.isChoose('id'), width: 100 }, 
    { title: this.i18n.fanyi("number"),  index: 'number' , iif: () => this.isChoose('number') ,  }, 
    { title: this.i18n.fanyi("warehouse.id"),  index: 'warehouseId' , iif: () => this.isChoose('warehouseId') , }, 
    { title: this.i18n.fanyi("warehouse.name"),  index: 'warehouseName' , iif: () => this.isChoose('warehouseName'),   }, 
    { title: this.i18n.fanyi("item.id"),  index: 'itemId' , iif: () => this.isChoose('itemId') ,  }, 
    { title: this.i18n.fanyi("item.name"),  index: 'itemName' , iif: () => this.isChoose('itemName') ,  }, 
    { title: this.i18n.fanyi("poNumber"),  index: 'poNumber' , iif: () => this.isChoose('poNumber') }, 
    { title: this.i18n.fanyi("work-order.expected-quantity"),  index: 'expectedQuantity' , iif: () => this.isChoose('expectedQuantity') }, 
    { title: this.i18n.fanyi("integration.status"),  index: 'status' , iif: () => this.isChoose('status') },  
    {
      title: this.i18n.fanyi("integration.insertTime"), 
      render: 'insertTimeColumn',
      iif: () => this.isChoose('insertTime') 
    },    
    {
      title: this.i18n.fanyi("integration.lastUpdateTime"), 
      render: 'lastUpdateTimeColumn',
      iif: () => this.isChoose('lastUpdateTime') 
    },    
    {
      title: this.i18n.fanyi("integration.errorMessage"), 
      render: 'errorMessageColumn',
      iif: () => this.isChoose('errorMessage'),
      width: 150
    },     
    {
      title: this.i18n.fanyi("action"),  
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 110, 
      render: 'actionColumn',
    },  
    
  ]; 
  customColumns = [
    { label: this.i18n.fanyi("id"), value: 'id', checked: true },
    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("warehouse.id"), value: 'warehouseId', checked: true },
    { label: this.i18n.fanyi("warehouse.name"), value: 'warehouseName', checked: true },
    { label: this.i18n.fanyi("item.id"), value: 'itemId', checked: true },
    { label: this.i18n.fanyi("item.name"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("poNumber"), value: 'poNumber', checked: true },
    { label: this.i18n.fanyi("work-order.expected-quantity"), value: 'expectedQuantity', checked: true },
    { label: this.i18n.fanyi("integration.status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("integration.insertTime"), value: 'insertTime', checked: true },
    { label: this.i18n.fanyi("integration.lastUpdateTime"), value: 'lastUpdateTime', checked: true },
    { label: this.i18n.fanyi("integration.errorMessage"), value: 'errorMessage', checked: true },
    

  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
        this.st!.resetColumns({ emitReload: true });

    }
  }

  workOrderLineTableColumns: STColumn[] = [
    { title: this.i18n.fanyi("id"),  index: 'id' , width: 100 }, 
    { title: this.i18n.fanyi("number"),  index: 'number' ,   }, 
    { title: this.i18n.fanyi("itemId"),  index: 'itemId' ,   }, 
    { title: this.i18n.fanyi("itemName"),  index: 'itemName' ,   }, 
    { title: this.i18n.fanyi("expected-quantity"),  index: 'expectedQuantity' ,   }, 
    { title: this.i18n.fanyi("inventory-status.id"),  index: 'inventoryStatusId' ,   }, 
    { title: this.i18n.fanyi("inventory-status.name"),  index: 'inventoryStatusName' ,   }, 
    { title: this.i18n.fanyi("allocation-strategy"),  index: 'allocationStrategyType' ,   }, 
  ]

  workOrderByProductTableColumns: STColumn[] = [
    { title: this.i18n.fanyi("id"),  index: 'id' , width: 100 }, 
    { title: this.i18n.fanyi("itemId"),  index: 'itemId' ,   }, 
    { title: this.i18n.fanyi("itemName"),  index: 'itemName' ,   }, 
    { title: this.i18n.fanyi("expected-quantity"),  index: 'expectedQuantity' ,   }, 
    { title: this.i18n.fanyi("inventory-status.id"),  index: 'inventoryStatusId' ,   }, 
    { title: this.i18n.fanyi("inventory-status.name"),  index: 'inventoryStatusName' ,   }, 
  ]
  
  workOrderInstructionTableColumns: STColumn[] = [
    { title: this.i18n.fanyi("id"),  index: 'id' , width: 100 }, 
    { title: this.i18n.fanyi("sequence"),  index: 'sequence' ,   }, 
    { title: this.i18n.fanyi("instruction"),  index: 'instruction' ,   }, 
    
  ]

  constructor(
    private fb: UntypedFormBuilder,
    private integrationWorkOrderService: IntegrationWorkOrderDataService, 
    private utilService: UtilService,
    private messageService: NzMessageService,
  ) {}
  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationWorkOrders = []; 
 
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
    this.integrationWorkOrderService.getData(startTime, endTime, specificDate, 
      this.searchForm.value.statusList.value,
      this.searchForm.value.id.value,
      this.searchForm.value.number.value,).subscribe(
        {
          next: (integrationWorkOrderRes) => {
            this.listOfAllIntegrationWorkOrders = integrationWorkOrderRes; 
     
             
            this.searching = false;
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: integrationWorkOrderRes.length,
            });

          }, 
          error: () => {
            this.searching = false;
            this.isSpinning = false;
            this.searchResult = '';
          },
        }
      );  
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
      number: [null],
      id: [null]
    });
  }
  
  resendIntegration(id: number) : void {
    this.integrationWorkOrderService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }

}
