import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingService } from '../../common/services/printing.service';
import { Item } from '../../inventory/models/item';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure';
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
    standalone: false
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
  codec = new HttpUrlEncodingCodec;


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
      title: this.i18n.fanyi("status"),   
      render: 'status',  
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
      title: this.i18n.fanyi("weight"),  
      render: 'weightColumn',  
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
      if (params['id']) {
        this.loadOrder(params['id']);
      }
    }); 

    
    this.parcelForm = this.fb.group({
      productId: [null],
      item: [null],
      caseQuantity: [null],
      unitCost: [null],
      length: [null],
      width: [null],
      height: [null],
      weight: [null], 
      packageCount: [1], 
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

        
        // if there's only one item in the order, set the parcel form's item
        // control to the only one item 
        if (this.currentOrder?.orderLines.length == 1) { 
          this.parcelForm.value.item.setValue(this.currentOrder?.orderLines[0].itemId);
          this.setupDefaultMeasurement(this.currentOrder?.orderLines[0].itemId!);
        }
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
    let item : Item | undefined = this.currentOrder?.orderLines.find(
      orderLine => orderLine.itemId == this.parcelForm.value.item.value
    )?.item;
     

    this.isSpinning = true;
    this.hualeiService.sendHualeiRequest(
      this.parcelForm.value.productId.value, 
      this.currentOrder!.id!, 
      this.parcelForm.value.length.value, 
      this.parcelForm.value.width.value, 
      this.parcelForm.value.height.value, 
      this.parcelForm.value.weight.value, 
      this.parcelForm.value.packageCount.value, 
      item?.name,
      this.parcelForm.value.caseQuantity.value, 
      this.parcelForm.value.unitCost.value, 
      ).subscribe({
        next: (shipmetnResponse) => {

          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.success"));

          this.loadOrder(this.currentOrder!.id!);

        }, 
        error: () => this.isSpinning = false
      })

  }
  refreshShipmentRequestTable() {
    
    this.loadOrder(this.currentOrder!.id!);
  }
  parcelFormValid() {
    if (this.parcelForm.value.productId.value == null) {
      this.messageService.error("product id is required")
      return false;
    }
    if (this.parcelForm.value.item.value == null) {
      this.messageService.error("item is required")
      return false;
    }
    if (this.parcelForm.value.length.value == null) {
      this.messageService.error("package length is required")
      return false;
    }
    if (this.parcelForm.value.width.value == null) {
      this.messageService.error("package width is required")
      return false;
    }
    if (this.parcelForm.value.height.value == null) {
      this.messageService.error("package height is required")
      return false;
    }
    if (this.parcelForm.value.weight.value == null) {
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

  itemChanged(itemId: number) {
    // console.log(`item id is changed to ${itemId}`);
    if (itemId != null) {

      this.setupDefaultMeasurement(itemId);
    }
    else {
      
      this.parcelForm.value.length.setValue("");
      this.parcelForm.value.width.setValue("");
      this.parcelForm.value.height.setValue("");
      this.parcelForm.value.weight.setValue("");
      this.parcelForm.value.caseQuantity.setValue("");
      this.parcelForm.value.unitCost.setValue("");
    }
  }
  setupDefaultMeasurement(itemId: number) {
    let item : Item | undefined = this.currentOrder?.orderLines.find(
      orderLine => orderLine.itemId == this.parcelForm.value.item.value
    )?.item; 

    let caseUnitOfMeasure : ItemUnitOfMeasure | undefined = 
        item?.defaultItemPackageType?.itemUnitOfMeasures.find(
          itemUnitOfMeasure => itemUnitOfMeasure.caseFlag == true
        );

    if (item != null && caseUnitOfMeasure != null) {
       
      this.parcelForm.value.length.setValue(caseUnitOfMeasure.length);
      this.parcelForm.value.width.setValue(caseUnitOfMeasure.width);
      this.parcelForm.value.height.setValue(caseUnitOfMeasure.height);
      this.parcelForm.value.weight.setValue(caseUnitOfMeasure.weight);
      this.parcelForm.value.caseQuantity.setValue(caseUnitOfMeasure.quantity);
      this.parcelForm.value.unitCost.setValue(item.unitCost);
    }
        
  }
  
  ngDecode(param: string){
    return this.codec.decodeValue(param);
  }

  jsDecode(param: string){
    return decodeURIComponent(param);
  }
}
