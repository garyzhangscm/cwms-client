import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Unit } from '../../common/models/unit';
import { UnitType } from '../../common/models/unit-type';
import { UnitService } from '../../common/services/unit.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { HualeiConfiguration } from '../models/hualei-configuration';
import { HualeiProduct } from '../models/hualei-product';
import { HualeiShippingLabelFormat } from '../models/hualei-shipping-label-format';
import { HualeiShippingLabelFormatByProduct } from '../models/hualei-shipping-label-format-by-product';
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
  
  @ViewChild('shippingLabelFormatTable', { static: true })
  shippingLabelFormatTable!: STComponent;
  shippingLabelFormatColumns: STColumn[] = [    
    {
      title: this.i18n.fanyi("productId"),  index: 'productId' ,
    }, 
    {
      title: this.i18n.fanyi("name"), 
      render: 'productNameColumn',  
    },  
    {
      title: this.i18n.fanyi("shippingLabelFormat"),  index: 'shippingLabelFormat' ,
    },      
    {
      title: this.i18n.fanyi("trackingInfoUrl"),  index: 'trackingInfoUrl' ,
    },    
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn',  
    },     
  ]; 
  
  currentHualeiConfiguration!: HualeiConfiguration;
  hualeiProducts: HualeiProduct[] = []; 
  hualeiProductsWithoutShippingLabelFormat: HualeiProduct[] = []; 
  hualeiShippingLabelFormats = HualeiShippingLabelFormat;

  lengthUnits: Unit[] = [];
  weightUnits: Unit[] = [];
  
  addProductForm!: UntypedFormGroup;
  addProductModal!: NzModalRef;
  
  addShippingLabelFormatForm!: UntypedFormGroup;
  addShippingLabelFormatModal!: NzModalRef;

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
    private unitService: UnitService,   
    private userService: UserService, ) { 
      
      userService.isCurrentPageDisplayOnly("/outbound/hualei-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );      

      this.currentHualeiConfiguration = {

        warehouseId: warehouseService.getCurrentWarehouse().id, 
        customerId: "",
        customerUserid: "",
    
        createOrderProtocol: "",
        createOrderHost: "",
        createOrderPort: "",
        createOrderEndpoint: "",
    
        printLabelProtocol: "",
        printLabelHost: "",
        printLabelPort: "",
        printLabelEndpoint: "", 
    
        defaultCargoType: "",
        defaultCustomsClearance: "",
        defaultCustomsDeclaration: "",
        defaultDutyType: "",
        defaultFrom: "",
        defaultIsFba: "",
        defaultOrderReturnSign: "",
        defaultHsCode: "",
        defaultInvoiceTitle: "",
        defaultSku: "",
        defaultSkuCode: "",
        
        weightUnit:  "",
        lengthUnit:  "",
        hualeiShippingLabelFormatByProducts: [],
      } 
  }

  ngOnInit(): void { 
  
    this.loadHualeiProducts();
    this.loadHualeiConfiguration();
    this.loadUnits();
  }
  loadHualeiConfiguration() {
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
  loadHualeiProducts() {
    this.isHualeiProductSpinning = true;
    this.hualeiProductService.getHualeiProducts().subscribe({
      next: (hualeiProductRes) => {
        this.hualeiProducts = hualeiProductRes
        this.isHualeiProductSpinning = false;
      }, 
      error: () => this.isHualeiProductSpinning = false
    });
  }
  
  loadUnits() {
    this.unitService.loadUnits().subscribe({
      next: (unitsRes) => {
        unitsRes.forEach(
          unit => {
            if (unit.type === UnitType.LENGTH) {
              this.lengthUnits.push(unit); 
            }
            else if (unit.type === UnitType.WEIGHT) {
              this.weightUnits.push(unit); 
            }
          }
        )
      }
    })    
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

  
  openAddProductModal( 
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
    const hualeiProduct: HualeiProduct = {      
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        productId: productId,
        name: name,
        description: description,
    };
    this.isHualeiProductSpinning = true;
    this.hualeiProductService.addHualeiProduct(hualeiProduct).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isHualeiProductSpinning = false;
        this.loadHualeiProducts();        
      },
      error: () => this.isHualeiProductSpinning = false
    })

  }
  
  
  openAddShippingLabelFormatModal( 
    tplAddShippingLabelFormatModalTitle: TemplateRef<{}>,
    tplAddShippingLabelFormatModalContent: TemplateRef<{}>, 
  ): void {
    
    this.addShippingLabelFormatForm = this.fb.group({ 
      productId: [null],
      shippingLabelFormat: [null], 
      trackingInfoUrl: [null], 
    });
 
    this.hualeiProductsWithoutShippingLabelFormat = 
      this.hualeiProducts.filter(product => 
        !this.currentHualeiConfiguration.hualeiShippingLabelFormatByProducts.some(
          shippingLabelFormat => shippingLabelFormat.productId == product.productId)
         
      );

    // Load the location
    this.addShippingLabelFormatModal = this.modalService.create({
      nzTitle: tplAddShippingLabelFormatModalTitle,
      nzContent: tplAddShippingLabelFormatModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addShippingLabelFormatModal.destroy(); 
      },
      nzOnOk: () => {
        if (this.addShippingLabelFormatForm.controls.productId.value == null) {
          this.messageService.error("please fill in the product id");
          return false; 
        }
        if (this.addShippingLabelFormatForm.controls.shippingLabelFormat.value == null) {
          this.messageService.error("please fill in the shipping label format");
          return false; 
        } 
        this.addShippingLabelFormat( 
          this.addShippingLabelFormatForm.controls.productId.value,
          this.addShippingLabelFormatForm.controls.shippingLabelFormat.value, 
          this.addShippingLabelFormatForm.controls.trackingInfoUrl.value, 
        );
        return true;
      },

      nzWidth: 1000,
    });
  }

  addShippingLabelFormat(productId: string, shippingLabelFormat: string,
    trackingInfoUrl: string) { 
    // make sure we will only have one format for each product id
    if (this.currentHualeiConfiguration.hualeiShippingLabelFormatByProducts.some(
      shippingLabelFormat => shippingLabelFormat.productId == productId
    )) {
      return;
    }
    var hualeiShippingLabelFormat : HualeiShippingLabelFormat 
      = HualeiShippingLabelFormat[shippingLabelFormat as keyof typeof HualeiShippingLabelFormat];

    
    this.currentHualeiConfiguration.hualeiShippingLabelFormatByProducts = 
    [
      ...this.currentHualeiConfiguration.hualeiShippingLabelFormatByProducts,
      {
        warehouseId: this.warehouseService.getCurrentWarehouse().id, 
        productId: productId,
        shippingLabelFormat: hualeiShippingLabelFormat,
        trackingInfoUrl: trackingInfoUrl,

      }
    ];

  }
  removeShippingLabelFormat(shippingLabelFormatByProduct: HualeiShippingLabelFormatByProduct) {

    this.currentHualeiConfiguration.hualeiShippingLabelFormatByProducts =         
      this.currentHualeiConfiguration.hualeiShippingLabelFormatByProducts.filter(
        shippingLabelFormat => shippingLabelFormat.productId != shippingLabelFormatByProduct.productId
      )
  }
  getProductNameByProductId(productId: string): string | undefined {
    return this.hualeiProducts.find(product => product.productId == productId)?.name;
  }
}
