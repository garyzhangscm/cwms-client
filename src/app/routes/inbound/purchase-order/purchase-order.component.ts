import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service'; 
import { LocalCacheService } from '../../util/services/local-cache.service';
import { PurchaseOrder } from '../models/purchase-order';
import { PurchaseOrderStatus } from '../models/purchase-order-status';
import { Receipt } from '../models/receipt';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ReceiptService } from '../services/receipt.service';

@Component({
    selector: 'app-inbound-purchase-order',
    templateUrl: './purchase-order.component.html',
    styleUrls: ['./purchase-order.component.less'],
    standalone: false
})
export class InboundPurchaseOrderComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;

  mapOfReceipt: { [key: string]: Receipt[] } = {};

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("purchase-order.number"),  index: 'number' , }, 
    {
      title: this.i18n.fanyi("supplier"),
      // renderTitle: 'customTitle',
      render: 'supplierColumn', 
    },
    { title: this.i18n.fanyi("totalItemCount"),  index: 'totalItemCount' , }, 
    { title: this.i18n.fanyi("totalLineCount"),  index: 'totalLineCount' , }, 
    { title: this.i18n.fanyi("totalExpectedQuantity"),  index: 'totalExpectedQuantity' , }, 
    { title: this.i18n.fanyi("totalReceiptQuantity"),  index: 'totalReceiptQuantity' , }, 
    { title: this.i18n.fanyi("totalReceivedQuantity"),  index: 'totalReceivedQuantity' , }, 
    { title: this.i18n.fanyi("status"),  index: 'status' , }, 
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ]; 

  
  searchForm!: UntypedFormGroup;
  purchaseOrders: PurchaseOrder[] = [];
  searchResult = "";
  validSuppliers: Supplier[] = [];

  purchaseOrderStatusList = PurchaseOrderStatus;
   
  displayOnly = false;
  constructor(  
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService, 
    private localCacheService: LocalCacheService,
    private userService: UserService,
    private supplierService: SupplierService,
    private receiptService: ReceiptService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/inbound/purchase-order").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                 
    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inbound.purchaseOrder'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      statusList: [null],
      supplier: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number']) {
        this.searchForm.value.number.setValue(params['number']);
        this.search();
      }
    });
  
    this.supplierService.loadSuppliers().subscribe(suppliers => (this.validSuppliers = suppliers));
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.purchaseOrders = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.purchaseOrderService
      .getPurchaseOrders(this.searchForm.value.number, 
        this.searchForm.value.statusList, 
        this.searchForm.value.supplier)
      .subscribe({

        next: (purchaseOrderRes) => {
          this.purchaseOrders = this.calculateQuantities(purchaseOrderRes);
          
          this.refreshDetailInformations(this.purchaseOrders);
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: purchaseOrderRes.length
          });
           

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  } 
  
  calculateQuantities(purchaseOrders: PurchaseOrder[]): PurchaseOrder[] {
    purchaseOrders.forEach(purchaseOrder => {
      const existingItemIds = new Set();
      purchaseOrder.totalExpectedQuantity = 0;
      purchaseOrder.totalReceiptQuantity = 0;
      purchaseOrder.totalReceivedQuantity = 0;
      purchaseOrder.totalLineCount = purchaseOrder.purchaseOrderLines.length;

      purchaseOrder.purchaseOrderLines.forEach(purchaseOrderLine => {
        purchaseOrder.totalExpectedQuantity! += purchaseOrderLine.expectedQuantity!;
        purchaseOrder.totalReceiptQuantity! += purchaseOrderLine.receiptQuantity!;
        purchaseOrder.totalReceivedQuantity! += purchaseOrderLine.receivedQuantity!;
        if (!existingItemIds.has(purchaseOrderLine.itemId)) {
          existingItemIds.add(purchaseOrderLine.itemId);
        }
      });
      purchaseOrder.totalItemCount = existingItemIds.size;
    });
    return purchaseOrders;
  }
 
  
  // we will load the client / supplier / item information 
  // asyncronized
  refreshDetailInformations(purchaseOrders: PurchaseOrder[]) { 
    purchaseOrders.forEach(
      purchaseOrder => this.refreshDetailInformation(purchaseOrder)
    );
  }
  refreshDetailInformation(purchaseOrder: PurchaseOrder) {
  
      this.loadClient(purchaseOrder); 
     
      this.loadSupplier(purchaseOrder); 

      // this.loadItems(purchaseOrder);
  }
  loadClient(purchaseOrder: PurchaseOrder) {
     
    if (purchaseOrder.clientId && purchaseOrder.client == null) {
      this.localCacheService.getClient(purchaseOrder.clientId).subscribe(
        {
          next: (clientRes) => purchaseOrder.client = clientRes
        }
      );
      
    }
  }
  
  loadSupplier(purchaseOrder: PurchaseOrder) { 
    if (purchaseOrder.supplierId && purchaseOrder.supplier == null) {
      
      this.localCacheService.getSupplier(purchaseOrder.supplierId).subscribe(
        {
          next: (supplierRes) => purchaseOrder.supplier = supplierRes
        }
      );
    }
  }

  purchaseOrderTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showPurchaseOrderDetails(event.expand);
    } 

  }
  
  showPurchaseOrderDetails(purchaseOrder: PurchaseOrder): void { 
      this.showReceipts(purchaseOrder);  
  }
  showReceipts(purchaseOrder: PurchaseOrder): void { 
    this.mapOfReceipt[purchaseOrder.id!]  = [];
    this.receiptService.getReceipts(undefined, false, undefined, undefined, undefined, 
      undefined, undefined, purchaseOrder.id).subscribe(
        {
          next: (receiptsRes) => {

            this.mapOfReceipt[purchaseOrder.id!] = [...receiptsRes];
            // load the receipt's supplier
            this.mapOfReceipt[purchaseOrder.id!].filter(
              receipt => receipt.supplierId != null && receipt.supplier == null
            ).forEach(receipt => {
              this.localCacheService.getSupplier(receipt.supplierId!).subscribe({
                next: (supplierRes) =>  receipt.supplier = supplierRes
              })
            })

          }
        }
      )
  }
}
