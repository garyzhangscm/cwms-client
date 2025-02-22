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
import { CarrierService } from '../../transportation/services/carrier.service';
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
    standalone: false
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
      title: this.i18n.fanyi("carrier"),  index: 'carrier.name' ,
    },     
    {
      title: this.i18n.fanyi("carrier.serviceLevel"),  index: 'carrierServiceLevel.name' ,
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
  hualeiShippingLabelFormatsKeys = Object.keys(this.hualeiShippingLabelFormats);

  lengthUnits: Unit[] = [];
  weightUnits: Unit[] = [];
  
  addProductForm!: UntypedFormGroup;
  addProductModal!: NzModalRef;
  
  addShippingLabelFormatForm!: UntypedFormGroup;
  addShippingLabelFormatModal!: NzModalRef;

  carrierOptions: any[] = [];

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
    private carrierService: CarrierService,
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
        
        getPackageStatusProtocol:  "",
        getPackageStatusHost:  "",
        getPackageStatusPort:  "",
        getPackageStatusEndpoint:  "",

        getTrackingNumberProtocol:  "",
        getTrackingNumberHost:  "",
        getTrackingNumberPort:  "",
        getTrackingNumberEndpoint:  "",
    
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
    this.loadCarriers();
  }

  loadCarriers() {
    this.carrierOptions = [];
    this.carrierService.loadCarriers(true).subscribe({

      next: (carrierRes) => {
        carrierRes.filter(
          carrier => carrier.enabled == true
        )
        .forEach(
          carrier => {
            let serviceLevels : any[] = [];
            carrier.carrierServiceLevels.forEach(
              carrierServiceLevel => {
                serviceLevels = [...serviceLevels, 
                    {
                      value: carrierServiceLevel.id,
                      label: carrierServiceLevel.name,
                      isLeaf: true
                    }
                ]
              }
            );
            this.carrierOptions = [...this.carrierOptions, 
            { 
              value: carrier.id,
              label: carrier.name,
              children: serviceLevels
            }]
          }
        )
      }
    })
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
      carrier: [null],
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
        if (this.addProductForm.value.productId.value == null) {
          this.messageService.error("please fill in the product id");
          return false; 
        }
        if (this.addProductForm.value.name.value == null) {
          this.messageService.error("please fill in the name");
          return false; 
        }
        if (this.addProductForm.value.description.value == null) {
          this.messageService.error("please fill in the description");
          return false; 
        }
        // get the carrier and service level for the hualei product
        let carrierId : number | undefined = undefined;
        let carrierServiceLevelId  : number | undefined = undefined;
        let carrierInformation : string = this.addProductForm.value.carrier.value.toString();
        if (carrierInformation) {
          console.log(`get carrier information ${carrierInformation}`);
          let carrierInformationArray : string[] = [];
          carrierInformationArray = carrierInformation.split(",");
          carrierId = +carrierInformationArray[0];
          carrierServiceLevelId = carrierInformationArray.length > 1 ? +carrierInformationArray[1] : undefined;
        }

        this.addProduct( 
          this.addProductForm.value.productId.value,
          this.addProductForm.value.name.value,
          this.addProductForm.value.description.value,
          carrierId, 
          carrierServiceLevelId
        );
        return true;
      },

      nzWidth: 1000,
    });
  }

  addProduct(productId: string, name: string, description: string, carrierId?: number, 
    carrierServiceLevelId?: number) {
    const hualeiProduct: HualeiProduct = {      
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        productId: productId,
        name: name,
        description: description,
        carrierId: carrierId, 
        carrierServiceLevelId: carrierServiceLevelId
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
        if (this.addShippingLabelFormatForm.value.productId.value == null) {
          this.messageService.error("please fill in the product id");
          return false; 
        }
        if (this.addShippingLabelFormatForm.value.shippingLabelFormat.value == null) {
          this.messageService.error("please fill in the shipping label format");
          return false; 
        } 
        this.addShippingLabelFormat( 
          this.addShippingLabelFormatForm.value.productId.value,
          this.addShippingLabelFormatForm.value.shippingLabelFormat.value,  
        );
        return true;
      },

      nzWidth: 1000,
    });
  }

  addShippingLabelFormat(productId: string, shippingLabelFormat: string) { 
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
        trackingInfoUrl: this.hualeiProducts.find(hualeiProduct => hualeiProduct.productId == productId)?.carrier?.trackingInfoUrl

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
