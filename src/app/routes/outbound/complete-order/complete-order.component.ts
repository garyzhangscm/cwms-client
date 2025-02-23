import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { OrderCategory } from '../models/order-category';
import { OrderService } from '../services/order.service';

@Component({
    selector: 'app-outbound-complete-order',
    templateUrl: './complete-order.component.html',
    standalone: false
})
export class OutboundCompleteOrderComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  
  stepIndex = 0; 
  isSpinning = false;
  currentOrder?: Order;
  orderCategories = OrderCategory;
  shippedQuantityMap : Map<string, number> = new Map()

  constructor(private http: _HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute, 
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private orderService: OrderService,) { 
    this.pageTitle = this.i18n.fanyi('menu.main.outbound.order-maintenance');}

  ngOnInit(): void { 
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        // Get the production line by ID
        this.orderService.getOrder(params['id'])
          .subscribe(orderRes => {
            this.currentOrder = orderRes; 
            // default the ship quantity to the order quantity
            this.currentOrder.orderLines.forEach(
              orderLine => this.shippedQuantityMap.set(orderLine.number, orderLine.expectedQuantity)
            );
 
          });
      } 
    });


  }
  
  previousStep() {
    this.stepIndex--;
  }
  nextStep() { 

      this.stepIndex++; 
  }

  confirm(){
    this.isSpinning = true;
    // assign the shipped quantity to the order line
    this.currentOrder?.orderLines.forEach(
      orderLine => {
        orderLine.shippedQuantity = this.shippedQuantityMap.has(orderLine.number) ? 
            this.shippedQuantityMap.get(orderLine.number)! : 0
      }
    )

    this.orderService.completeOrder(this.currentOrder!).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/outbound/order?number=${this.currentOrder?.number}`);
        }, 500);
      }, 
      error: () => this.isSpinning = false
    })
  }

  shippedQuantityChanged(orderLineNumber: string, shippedQuantity: number) {
    this.shippedQuantityMap.set(orderLineNumber, shippedQuantity);

  }

}
