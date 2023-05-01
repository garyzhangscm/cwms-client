import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingService } from '../../common/services/printing.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { HualeiConfigurationService } from '../services/hualei-configuration.service';
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

  
  @ViewChild('shipmentRequestTable', { static: true })
  shipmentRequestTable!: STComponent;
  shipmentRequestColumns: STColumn[] = [    
    {
      title: this.i18n.fanyi("shipTo"), 
      render: 'shipToColumn',  
    },     
    {
      title: this.i18n.fanyi("shipFrom"), 
      render: 'shipFromColumn',  
    },     
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
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private parcelService: ParcelService,
    private messageService: NzMessageService,
    private router: Router, 
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
  
  
}
