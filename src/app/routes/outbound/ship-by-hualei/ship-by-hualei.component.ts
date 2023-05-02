import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingService } from '../../common/services/printing.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { HualeiConfiguration } from '../models/hualei-configuration';
import { HualeiProduct } from '../models/hualei-product';
import { Order } from '../models/order';
import { HualeiConfigurationService } from '../services/hualei-configuration.service';
import { HualeiProductService } from '../services/hualei-product.service';
import { HualeiService } from '../services/hualei.service';
import { OrderService } from '../services/order.service';
import { ParcelService } from '../services/parcel.service';

@Component({
  selector: 'app-outbound-ship-by-hualei',
  templateUrl: './ship-by-hualei.component.html',
})
export class OutboundShipByHualeiComponent implements OnInit {
  currentOrder?: Order; 
  currentWarehouse!: Warehouse;
  pageTitle: string;
  isSpinning = false;
  stepIndex = 0; 
  hualeiConfigurationSetup?: boolean;
  hualeiConfiguration?: HualeiConfiguration;
  isAddressCollapse = true;
  hualeiProducts: HualeiProduct[] = []; 


  // Form related data and functions
  parcelForm!: UntypedFormGroup;
  
  @ViewChild('shipmentRequestTable', { static: true })
  shipmentRequestTable!: STComponent;
  shipmentRequestColumns: STColumn[] = [     
    {
      title: this.i18n.fanyi("requestTime"),   
      render: 'requestTimeColumn',  
    },    
    {
      title: this.i18n.fanyi("isFba"),  index: 'param.is_fba' ,
    }, 
    {
      title: this.i18n.fanyi("productId"),  index: 'param.product_id' ,
    }, 
    {
      title: this.i18n.fanyi("name"), 
      render: 'productNameColumn',  
    },  
    {
      title: this.i18n.fanyi("weight"),  index: 'param.weight' ,
    },     
    {
      title: this.i18n.fanyi("volume"), 
      render: 'volumeColumn',  
    },        
    {
      title: this.i18n.fanyi("response"), 
      render: 'responseColumn',  
    },   
  ]; 
  
  packageLength = 0; 
  packageWidth = 0; 
  packageHeight = 0; 
  packageWeight = 0;  


  constructor(private http: _HttpClient, 
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService, 
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private parcelService: ParcelService,
    private messageService: NzMessageService,
    private router: Router, 
    private hualeiProductService: HualeiProductService,
    private hualeiService: HualeiService,
    private warehouseService: WarehouseService, 
    private printingService: PrintingService,
    private hualeiConfigurationService: HualeiConfigurationService) { 
      this.currentWarehouse = warehouseService.getCurrentWarehouse();
      this.pageTitle = this.i18n.fanyi('ship-by-hualei');

      hualeiConfigurationService.getHualeiConfiguration().subscribe({
        next: (hualeiConfigurationRes) => {

          if (hualeiConfigurationRes == null) {
            this.hualeiConfigurationSetup = false;
          }
          else {            
            this.hualeiConfigurationSetup = true;
            this.hualeiConfiguration = hualeiConfigurationRes;
          }
        }, 
        error: () => this.hualeiConfigurationSetup = false
      })
    }

  ngOnInit(): void { 
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.loadOrder(params.id);
      }
    }); 

    
    this.parcelForm = this.fb.group({
      productId: [null],
      length: [null],
      width: [null],
      height: [null],
      weight: [null], 
    });
    this.loadHualeiProducts();
  }
  
  loadOrder(orderId: number) {
    this.isSpinning = true;
    this.orderService.getOrder(orderId).subscribe({
      next: (orderRes) => {
        this.currentOrder = orderRes;
        this.isSpinning = false;
        this.setupURL();
      },
      error: () => this.isSpinning = false
    })
  }
  setupURL() {
    if (this.currentOrder!.hualeiShipmentRequests && this.currentOrder!.hualeiShipmentRequests.length > 0) {

      this.currentOrder!.hualeiShipmentRequests.filter(
        hualeiShipmentRequest => hualeiShipmentRequest.shipmentResponse != null 
      ).forEach(
        hualeiShipmentRequest => {
           if (hualeiShipmentRequest.shipmentResponse?.order_id != null && this.hualeiConfiguration!= null) {
            let shippingLabelFormatByProduct = this.hualeiConfiguration.hualeiShippingLabelFormatByProducts.find(
              hualeiShippingLabelFormatByProduct => hualeiShippingLabelFormatByProduct.productId == hualeiShipmentRequest.param.product_id
            ); 
            if (this.hualeiConfiguration?.printLabelProtocol && 
                  this.hualeiConfiguration?.printLabelHost && 
                  this.hualeiConfiguration?.printLabelPort && 
                  this.hualeiConfiguration?.printLabelEndpoint && 
                  shippingLabelFormatByProduct?.shippingLabelFormat) {
              
              hualeiShipmentRequest.shipmentResponse.shippingLabelUrl 
                    = `${this.hualeiConfiguration?.printLabelProtocol}://${this.hualeiConfiguration?.printLabelHost}:${this.hualeiConfiguration?.printLabelPort}/${this.hualeiConfiguration?.printLabelEndpoint}?PrintType=${shippingLabelFormatByProduct?.shippingLabelFormat}&order_id=${hualeiShipmentRequest.shipmentResponse?.order_id}`;
                  
            }
            else {              
              hualeiShipmentRequest.shipmentResponse.shippingLabelUrl = "";
            }
            
            if (shippingLabelFormatByProduct?.trackingInfoUrl) {
              hualeiShipmentRequest.shipmentResponse.trackingUrl 
              = `${shippingLabelFormatByProduct?.trackingInfoUrl}${hualeiShipmentRequest.shipmentResponse.tracking_number}`;
            }
            else {
              hualeiShipmentRequest.shipmentResponse.trackingUrl  = "";
            }
          }

        }
      );
    }
  }
  
  loadHualeiProducts() { 
    this.hualeiProductService.getHualeiProducts().subscribe({
      next: (hualeiProductRes) => {
        this.hualeiProducts = hualeiProductRes 
      }
    });
  }

  toggleCollapse(): void {
    this.isAddressCollapse = !this.isAddressCollapse;
  }

  addPackage() {
    if (!this.parcelFormValid()) {
      return;
    } 
    
    this.isSpinning = true;
    this.hualeiService.sendHualeiRequest(
      this.parcelForm.controls.productId.value, 
      this.currentOrder!.id!, 
      this.parcelForm.controls.length.value, 
      this.parcelForm.controls.width.value, 
      this.parcelForm.controls.height.value, 
      this.parcelForm.controls.weight.value).subscribe({
        next: (shipmetnResponse) => {

          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.success"));

          this.loadOrder(this.currentOrder!.id!);

        }, 
        error: () => this.isSpinning = false
      })

  }
  parcelFormValid() {
    if (this.parcelForm.controls.productId.value == null) {
      this.messageService.error("product id is required")
      return false;
    }
    if (this.parcelForm.controls.length.value == null) {
      this.messageService.error("package length is required")
      return false;
    }
    if (this.parcelForm.controls.width.value == null) {
      this.messageService.error("package width is required")
      return false;
    }
    if (this.parcelForm.controls.height.value == null) {
      this.messageService.error("package height is required")
      return false;
    }
    if (this.parcelForm.controls.weight.value == null) {
      this.messageService.error("package weight is required")
      return false;
    }


    return true;
  }
  
  getProductNameByProductId(productId: string): string | undefined {
    return this.hualeiProducts.find(product => product.productId == productId)?.name;
  }
  configureHualei() {
    
    this.router.navigateByUrl('outbound/hualei-configuration');
  }
}
