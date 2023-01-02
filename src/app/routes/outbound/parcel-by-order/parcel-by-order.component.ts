import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';

import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { EasyPostRate } from '../models/easy-post-rate';
import { EasyPostShipment } from '../models/easy-post-shipment';
import { Order } from '../models/order';
import { OrderService } from '../services/order.service';
import { ParcelService } from '../services/parcel.service';

@Component({
  selector: 'app-outbound-parcel-by-order',
  templateUrl: './parcel-by-order.component.html',
})
export class OutboundParcelByOrderComponent implements OnInit {

  currentOrder?: Order;
  currentEasyPostShipment?: EasyPostShipment;
  currentWarehouse!: Warehouse;
  pageTitle: string;
  isSpinning = false;
  stepIndex = 0; 
  
  packageLength = 0; 
  packageWidth = 0; 
  packageHeight = 0; 
  packageWeight = 0; 


  constructor(private http: _HttpClient, 
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private parcelService: ParcelService,
    private messageService: NzMessageService,
    private router: Router, 
    private warehouseService: WarehouseService) { 
      this.currentWarehouse = warehouseService.getCurrentWarehouse();
      this.pageTitle = this.i18n.fanyi('parcel-by-order');

    }

  ngOnInit(): void { 
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.isSpinning = true;
        this.orderService.getOrder(params.id).subscribe({
          next: (orderRes) => {
            this.currentOrder = orderRes;
            this.isSpinning = false;
          },
          error: () => this.isSpinning = false
        })
      }
    });

  }

  
  previousStep() {
    this.stepIndex--;
  }
  nextStep() { 

      this.stepIndex++; 
      if (this.stepIndex == 1) {
        // load the rate for the your input
        this.loadRate();
      }
  }
  readyForNextStep() : boolean {
    
    if (this.stepIndex == 0) {
        // only allow the user to continue if the user fill in the length / width / height
        return this.packageLength > 0 && this.packageWidth > 0 && this.packageHeight > 0 && this.packageWeight > 0;
    }
    else if (this.stepIndex == 1) {
      // only allow the user to continue if the user choose a rate
      return this.currentEasyPostShipment?.selectedRate != null;

    };
    return true;
  }


  loadRate() {
    this.isSpinning = true;
    this.parcelService.createEasyPostShipment(
      this.currentOrder!.id!, 
      this.packageLength, this.packageWidth, this.packageHeight, 
      this.packageWeight,  
    ).subscribe({
      next: (shipmentRes) => {

        this.currentEasyPostShipment = shipmentRes;
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    })
  }
  confirm() {
    this.isSpinning = true;
    this.parcelService.confirmEasyPostShipment(this.currentOrder!.id!, 
      this.currentEasyPostShipment!.id, this.currentEasyPostShipment!.selectedRate)
    .subscribe({
      next: () => {
        console.log(`parcel shipment is confirmed`); 
        
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/outbound/order?number=${this.currentOrder?.number}`);
        }, 500);
      }, 
      error: () => this.isSpinning = false
    })
  }

  rateSelected(rate: EasyPostRate) {
    // console.log(`the user chose rate: ${JSON.stringify(rate)}`);
    console.log(`the user chose rate: ${rate.carrier}`);
    console.log(`this.currentOrder?.carrier?.name: ${this.currentOrder?.carrier?.name}`);

    // see if the orders has specific carrier and service level
    if (this.currentOrder?.carrier?.name != null && this.currentOrder.carrier.name != rate.carrier) {
      // check if the carrier matches
      this.messageService.error(this.i18n.fanyi("selected-carrier-doesnot-match-with-order"));
      return;
    }
    if (this.currentOrder?.carrierServiceLevel != null && this.currentOrder.carrierServiceLevel.name != rate.service) {
      // check if the carrier matches
      this.messageService.error(this.i18n.fanyi("selected-carrier-carrier-doesnot-match-with-order"));
      return;
    }

    this.currentEasyPostShipment!.selectedRate = rate;
  }

  getLogo(rate: EasyPostRate) : string{
    if (rate.carrier.startsWith("UPS")) {
      return "https://www.ups.com/assets/resources/webcontent/images/ups-logo.svg";
    }
    else if (rate.carrier.startsWith("USPS")) {
      return "https://logodownload.org/wp-content/uploads/2021/03/united-states-postal-service-usps-logo-0.png";
    }
    else {
      return "";
    }

  }
  isBestRate(rate: EasyPostRate) : boolean{

    // return true if there's no other rate that is better then current rate
    return !this.currentEasyPostShipment?.rates.some(
      existingRate => existingRate.rate < rate.rate
    )
  }
  getBackgroundColor(rate: EasyPostRate) : string{

    if (this.isBestRate(rate)) {
      return "lawngreen";
    }
    return "";
  }
}
