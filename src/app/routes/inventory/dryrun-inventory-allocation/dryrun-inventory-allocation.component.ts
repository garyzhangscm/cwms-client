import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { Order } from '../../outbound/models/order';
import { OrderLine } from '../../outbound/models/order-line';
import { OrderLineService } from '../../outbound/services/order-line.service'; 
import { WorkOrder } from '../../work-order/models/work-order';
import { WorkOrderLine } from '../../work-order/models/work-order-line';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { AllocationDryRunResult } from '../models/allocation-dry-run-result';
import { InventoryService } from '../services/inventory.service';

@Component({
    selector: 'app-inventory-dryrun-inventory-allocation',
    templateUrl: './dryrun-inventory-allocation.component.html',
    styleUrls: ['./dryrun-inventory-allocation.component.less'],
    standalone: false
})
export class InventoryDryrunInventoryAllocationComponent implements OnInit {

  isSpinning = false;
  
  workOrder?: WorkOrder;
  workOrderLine?: WorkOrderLine;
  order?: Order;
  orderLine?: OrderLine;

  
  pageTitle = '';
  lastPageUrl = '';
  type = 'NONE';
  id = '';
  
  searchResult = ''; 
  
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("location"), index: 'locationName',  
      filter: {
        type: 'keyword', 
        fn: (filter, record) =>  !filter.value || record.locationName.indexOf(filter.value) !== -1 
      }
    },    
    { title: this.i18n.fanyi("lpn"), index: 'inventory.lpn',  
      filter: {
        type: 'keyword', 
        fn: (filter, record) => !filter.value || record.inventory.lpn.indexOf(filter.value) !== -1 
      }
    },    
    { title: this.i18n.fanyi("item"), index: 'item.name',  },   
    { title: this.i18n.fanyi("inventory-status"), index: 'inventoryStatus.name',  },   
    { title: this.i18n.fanyi("quantity"), index: 'inventory.quantity',  },   
    { title: this.i18n.fanyi("allocatible"), index: 'allocatible',  
      filter: {
        menus: [
          { text: 'true', value: 1 },
          { text: 'false', value: 2 }
        ],
        fn: (filter, record) => !filter.value || record.allocatible == filter.value,
        multiple: false
      }
    },   
    { title: this.i18n.fanyi("allocationFailReason"), index: 'allocationFailReason',  },    
  ];
  
  allocationDryRunResults: AllocationDryRunResult[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private workOrderService: WorkOrderService, 
    private router: Router,
    private inventoryService: InventoryService,
    private orderLineService: OrderLineService,) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('allocationDryRunResult'));
    this.pageTitle = this.i18n.fanyi('allocationDryRunResult');
    
    // check if we are dryrun allocation for
    // 1. outbound order 
    // 3. work order
    this.activatedRoute.queryParams.subscribe(params => {
      this.type = params.type ? params.type : '';

      if (params.id) {
        this.id = params.id;
      }
      this.displayInformation();
    });
  }

  displayInformation(): void {
    switch (this.type) {
      case 'workOrderLine':
        this.displayWorkOrderLine(+this.id);
        break;
      case 'orderLine':
        this.displayOrderLine(+this.id);
        break; 
       
    }
  }
  
  displayOrderLine(orderLineId: number): void {
    // Let's get the order line by id
    this.isSpinning = true;
    this.orderLineService.getOrderLine(orderLineId).subscribe({
      next: (orderLineRes) => {
        this.orderLine = orderLineRes;
        this.lastPageUrl = `/outbound/order?number=${this.orderLine.orderNumber}`;
        this.inventoryService.getAllocationDryRunResult(
          this.orderLine.itemId!, this.orderLine.inventoryStatusId!,
          this.orderLine.clientId).subscribe({
            next: (allocationDryRunResultRes) => {
              this.allocationDryRunResults = allocationDryRunResultRes;
              
              this.allocationDryRunResults.forEach(
                result => {
                  console.log(`>> location: ${result.locationName}, lpn: ${result.inventory.lpn}, allocatable? ${result.allocatible}, locationInventoryQuantity: ${result.locationInventoryQuantity}, locationOpenPickQuantity: ${result.locationOpenPickQuantity}`);
                }
              )
              this.searchResult = this.i18n.fanyi('search_result_analysis', {
                currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
                rowCount: allocationDryRunResultRes.length
              });

              this.isSpinning = false;
            }, 
            error: () => this.isSpinning = false
          });
      }, 
      error: () => this.isSpinning = false
    });
  }
  
  displayWorkOrderLine(workOrderLineId: number): void {
    // Let's get the order line by id
    this.isSpinning = true;
    this.workOrderService.getWorkOrderLine(workOrderLineId).subscribe({
      next: (workOrderLineRes) => {
        this.workOrderLine = workOrderLineRes;
        this.lastPageUrl = `/work-order/work-order?number=${this.workOrderLine.workOrderNumber}`;
        this.inventoryService.getAllocationDryRunResult(
          this.workOrderLine.itemId!, this.workOrderLine.inventoryStatusId!).subscribe({
            next: (allocationDryRunResultRes) => {
              this.allocationDryRunResults = allocationDryRunResultRes;
              
              this.searchResult = this.i18n.fanyi('search_result_analysis', {
                currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
                rowCount: allocationDryRunResultRes.length
              });
              this.isSpinning = false;
            }, 
            error: () => this.isSpinning = false
          });
      }, 
      error: () => this.isSpinning = false
    });
  }
  
  returnToPreviousPage(): void {
    this.router.navigateByUrl(this.lastPageUrl);
  }
}
