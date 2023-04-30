import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { HualeiConfiguration } from '../models/hualei-configuration';
import { HualeiProduct } from '../models/hualei-product';
import { HualeiConfigurationService } from '../services/hualei-configuration.service';
import { HualeiProductService } from '../services/hualei-product.service';

@Component({
  selector: 'app-outbound-hualei-configuration',
  templateUrl: './hualei-configuration.component.html',
})
export class OutboundHualeiConfigurationComponent implements OnInit {
  
  @ViewChild('hualeiProductsSt', { static: true })
  hualeiProductsSt!: STComponent;
  hualeiProductsColumns: STColumn[] = [    
    {
      title: this.i18n.fanyi("productId"),  index: 'productId' ,
    }, 
    {
      title: this.i18n.fanyi("name"),  index: 'name' ,
    },     
    {
      title: this.i18n.fanyi("description"),  index: 'description' ,
    },     
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn',  
    },     
  ]; 
  
  currentHualeiConfiguration!: HualeiConfiguration;
  hualeiProducts: HualeiProduct[] = []; 

  
  addProductForm!: UntypedFormGroup;
  addProductModal!: NzModalRef;

  isHualeiConfigurationSpinning = false;
  isHualeiProductSpinning = false;
  displayOnly = false;

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private fb: UntypedFormBuilder,
    private messageService: NzMessageService, 
    private modalService: NzModalService,
    private hualeiConfigurationService: HualeiConfigurationService,
    private hualeiProductService: HualeiProductService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,    
    private userService: UserService, ) { 
      
      userService.isCurrentPageDisplayOnly("/outbound/hualei-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );      

      this.currentHualeiConfiguration = {

        warehouseId: warehouseService.getCurrentWarehouse().id, 
        customerId: "",
        customerUserid: "",
    
        protocal: "",
        host: "",
        port: "",
    
        createOrderEndpoint: "",
        printLabelEndpoint: "",
    
        defaultCargoType: "",
        defaultCustomsClearance: "",
        defaultCustomsDeclaration: "",
        defaultDutyType: "",
        defaultFrom: "",
        defaultIsFba: "",
        defaultOrderReturnSign: "",
        
        hualeiShippingLabelFormatByProducts: [],
      } 
  }

  ngOnInit(): void { 
  
    this.loadHualeiProducts();
    this.loadHualeiConfiguration();
  }
  loadHualeiProducts() {
    this.isHualeiConfigurationSpinning = true;
    this.hualeiConfigurationService.getHualeiConfiguration().subscribe({
      next: (hualeiConfigurationRes) => {
        if (hualeiConfigurationRes != null) {
          this.currentHualeiConfiguration = hualeiConfigurationRes;
        }
        
        this.isHualeiConfigurationSpinning = false;
      }, 
      error: () => this.isHualeiConfigurationSpinning = false
    });
  }
  loadHualeiConfiguration() {
    this.isHualeiProductSpinning = true;
    this.hualeiProductService.getHualeiProducts().subscribe({
      next: (hualeiProductRes) => {
        this.hualeiProducts = hualeiProductRes
        this.isHualeiProductSpinning = false;
      }, 
      error: () => this.isHualeiProductSpinning = false
    });
  }

  confirmHualeiConfiguration() {

    this.isHualeiConfigurationSpinning = true;
    this.hualeiConfigurationService.addHualeiConfiguration(this.currentHualeiConfiguration).subscribe({
      next: (hualeiConfigurationRes) => {
        if (hualeiConfigurationRes != null) {
          this.currentHualeiConfiguration = hualeiConfigurationRes;
        }
        this.isHualeiConfigurationSpinning = false;
      }, 
      error: () => this.isHualeiConfigurationSpinning = false
    });
  }
  removeHualeiProduct(product: HualeiProduct) {

    this.isHualeiProductSpinning = true;
    this.hualeiProductService.removeHualeiProduct(product).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        
        this.isHualeiProductSpinning = false;
        this.loadHualeiProducts();
      }, 
      error: () => this.isHualeiProductSpinning = false
    });
  }

  
  openMoveInventoryModal( 
    tplAddProductModalTitle: TemplateRef<{}>,
    tplAddProductModalContent: TemplateRef<{}>, 
  ): void {
    
    this.addProductForm = this.fb.group({ 
      productId: [null],
      name: [null],
      description: [null],
    });
 
    // Load the location
    this.addProductModal = this.modalService.create({
      nzTitle: tplAddProductModalTitle,
      nzContent: tplAddProductModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addProductModal.destroy(); 
      },
      nzOnOk: () => {
        if (this.addProductForm.controls.productId.value == null) {
          this.messageService.error("please fill in the product id");
          return false; 
        }
        if (this.addProductForm.controls.name.value == null) {
          this.messageService.error("please fill in the name");
          return false; 
        }
        if (this.addProductForm.controls.description.value == null) {
          this.messageService.error("please fill in the description");
          return false; 
        }
        this.addProduct( 
          this.addProductForm.controls.productId.value,
          this.addProductForm.controls.name.value,
          this.addProductForm.controls.description.value,
        );
        return true;
      },

      nzWidth: 1000,
    });
  }

  addProduct(productId: string, name: string, description: string) {
    
  }
  
}
