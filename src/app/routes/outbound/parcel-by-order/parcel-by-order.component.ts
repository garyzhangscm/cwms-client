import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

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
    private warehouseService: WarehouseService) { 
      this.currentWarehouse = warehouseService.getCurrentWarehouse();
      this.pageTitle = this.i18n.fanyi('parcel-by-order');

    }

  ngOnInit(): void { 
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.orderService.getOrder(params.id).subscribe({
          next: (orderRes) => this.currentOrder = orderRes
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


  loadRate() {
    this.isSpinning = true;
    this.parcelService.createEasyPostShipment(
      this.currentOrder!.id!, 
      this.packageLength, this.packageWidth, this.packageHeight, 
      this.packageWeight
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
    this.parcelService.confirmEasyPostShipment(this.currentEasyPostShipment!.id, this.currentEasyPostShipment!.selectedRate)
    .subscribe({
      next: (shipmentRes) => {
        console.log(`parcel shipment is confirmed`);
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    })
  }

  rateSelected(rate: EasyPostRate) {
    console.log(`the user chose rate: ${JSON.stringify(rate)}`);

    this.currentEasyPostShipment!.selectedRate = rate;
  }
}
