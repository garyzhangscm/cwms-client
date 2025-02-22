import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PurchaseOrder } from '../models/purchase-order';
import { PurchaseOrderStatus } from '../models/purchase-order-status';
import { PurchaseOrderService } from '../services/purchase-order.service';

@Component({
    selector: 'app-inbound-create-receipt-from-po',
    templateUrl: './create-receipt-from-po.component.html',
    standalone: false
})
export class InboundCreateReceiptFromPoComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentPurchaseOrder!: PurchaseOrder;
  stepIndex = 0;
  pageTitle: string; 
  receiptNumber: string = "";
  isSpinning = false;

  // key: purchase order line id
  // value: receipt line's expected quantity 
  receiptQuantities: Array<{ purchaseOrderLineId: number; quantity: number }> = [];

  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private purchaseOrderService: PurchaseOrderService,
    private messageService: NzMessageService,
    private router: Router, 
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('create-receipt');

    this.currentPurchaseOrder = this.createEmptyPurchaseOrder();
  }

  createEmptyPurchaseOrder(): PurchaseOrder {
    return {
 
  
      purchaseOrderLines: [],
      status: PurchaseOrderStatus.OPEN,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

    }
  }


  ngOnInit(): void {

    this.receiptQuantities = [];

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['poid']) {
        // Get the purchase order by ID
        this.purchaseOrderService.getPurchaseOrder(params['poid'])
          .subscribe( {
            next: (purchaseOrderRes) => {
              console.log(`get purchase order ${purchaseOrderRes.number}`)
              this.currentPurchaseOrder = purchaseOrderRes;
              this.currentPurchaseOrder.purchaseOrderLines.forEach(
                purchaseOrderLine => { 
                  
                  this.receiptQuantities.push({ 
                    purchaseOrderLineId: purchaseOrderLine.id!, quantity: 0 });
                }
              )
            }
          });
      }
    });

  }


  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {  
    this.isSpinning = true;
    this.purchaseOrderService.createReceipt(
      this.currentPurchaseOrder.id!, this.receiptNumber, false, this.receiptQuantities
    ).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/inbound/purchase-order?number=${this.currentPurchaseOrder.number}`);
        }, 500);
      }, 
      error: () => this.isSpinning = false
    })
  }

  currentReceiptLineQuantityChanged(purchaseOrderLineId: number, newReceiptLineQuantity: number) {
 
    let item = this.receiptQuantities.find(item => item.purchaseOrderLineId == purchaseOrderLineId);
    if (item != null) {
      item.quantity = newReceiptLineQuantity;
    } 

  }

  
  receiptNumberChanged(newReceiptNumber: string) {
    
    this.receiptNumber = newReceiptNumber;
  }

  
  getReceiptLineQuantity(purchaseOrderLineId: number) {

    let item = this.receiptQuantities.find(item => item.purchaseOrderLineId == purchaseOrderLineId);
    if (item != null) {
      return item.quantity;
    } 
    return 0;
  }

}
