import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingService } from '../../common/services/printing.service';
import { EasyPostCarrier } from '../../transportation/models/easy-post-carrier';
import { EasyPostConfiguration } from '../../transportation/models/easy-post-configuration';
import { EasyPostConfigurationService } from '../../transportation/services/easy-post-configuration.service';
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
    standalone: false
})
export class OutboundParcelByOrderComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
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
  easyPostConfiguration?: EasyPostConfiguration;


  constructor(private http: _HttpClient, 
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,  
    private parcelService: ParcelService,
    private messageService: NzMessageService,
    private router: Router, 
    private warehouseService: WarehouseService, 
    private printingService: PrintingService,
    private easyPostConfigurationService: EasyPostConfigurationService) { 
      this.currentWarehouse = warehouseService.getCurrentWarehouse();
      this.pageTitle = this.i18n.fanyi('parcel-by-order');

    }

  ngOnInit(): void { 
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.isSpinning = true;
        this.orderService.getOrder(params['id']).subscribe({
          next: (orderRes) => {
            this.currentOrder = orderRes;
            this.isSpinning = false;
          },
          error: () => this.isSpinning = false
        })
      }
    });

    this.easyPostConfigurationService.getConfiguration().subscribe({
      next: (configurationRes) => this.easyPostConfiguration = configurationRes
    })

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
      next: (easyPostShipment) => {
        console.log(`parcel shipment is confirmed`); 

        const easyPostCarrier = this.easyPostConfiguration?.carriers.find(
          carrier => carrier.carrier?.name === this.currentEasyPostShipment!.selectedRate.carrier
        );
        if (easyPostCarrier && easyPostCarrier.printParcelLabelAfterManifestFlag) {
          // let's check if we will need to print the parcel label automatically
          if (easyPostCarrier.printerName == null) {
            
            this.messageService.success(this.i18n.fanyi('parcel-shipment-saved-no-printer-config')); 
          }
          else {
            this.printParcelLabel(easyPostCarrier, easyPostShipment);
            this.messageService.success(this.i18n.fanyi('parcel-shipment-saved-parcel-label-printed'));  

          }
        }else {

          this.messageService.success(this.i18n.fanyi('parcel-shipment-created')); 
        }
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

  
  printParcelLabel(easyPostCarrier: EasyPostCarrier, easyPostShipment: EasyPostShipment): void { 
    
    this.printingService.printFileByURL( 
      easyPostShipment.postageLabel.labelUrl,
      easyPostCarrier.reportType,
      easyPostCarrier.printerName!,
      easyPostCarrier.labelCopyCount == null ? 1 : easyPostCarrier.labelCopyCount); 
  }
}
