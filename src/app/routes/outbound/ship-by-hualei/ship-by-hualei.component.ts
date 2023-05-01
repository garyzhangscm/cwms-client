import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingService } from '../../common/services/printing.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
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
  isAddressCollapse = true;
  hualeiProducts: HualeiProduct[] = []; 

  // Form related data and functions
  parcelForm!: UntypedFormGroup;
  
  @ViewChild('shipmentRequestTable', { static: true })
  shipmentRequestTable!: STComponent;
  shipmentRequestColumns: STColumn[] = [     
    {
      title: this.i18n.fanyi("isFba"),  index: 'param.is_fba' ,
    }, 
    {
      title: this.i18n.fanyi("productId"),  index: 'param.product_id' ,
    }, 
    {
      title: this.i18n.fanyi("weight"),  index: 'param.weight' ,
    },     
    {
      title: this.i18n.fanyi("volume"), 
      render: 'volumeColumn',  
    },     
    {
      title: this.i18n.fanyi("invoice"), 
      render: 'invoiceColumn',  
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
      },
      error: () => this.isSpinning = false
    })
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
    console.log(`start to add package `);
    console.log(`this.searchForm.controls.productId.value: ${this.parcelForm.controls.productId.value}`);
    console.log(`this.searchForm.controls.length.value: ${this.parcelForm.controls.length.value}`);
    console.log(`this.searchForm.controls.width.value: ${this.parcelForm.controls.width.value}`);
    console.log(`this.searchForm.controls.height.value: ${this.parcelForm.controls.height.value}`);
    console.log(`this.searchForm.controls.weight.value: ${this.parcelForm.controls.weight.value}`);
    
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
  
}
