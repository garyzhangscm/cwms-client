import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STChange, STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import {  NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { UnitType } from '../../common/models/unit-type';
import { ClientService } from '../../common/services/client.service';
import { UnitService } from '../../common/services/unit.service'; 
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryConfiguration } from '../models/inventory-configuration';
import { Item } from '../models/item';
import { ItemBarcode } from '../models/item-barcode';
import { ItemBarcodeType } from '../models/item-barcode-type';
import { ItemFamily } from '../models/item-family';
import { InventoryConfigurationService } from '../services/inventory-configuration.service';
import { ItemBarcodeService } from '../services/item-barcode.service';
import { ItemFamilyService } from '../services/item-family.service';
import { ItemService } from '../services/item.service';

@Component({
    selector: 'app-inventory-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.less'],
    standalone: false
})
export class InventoryItemComponent implements OnInit {
  
  
  isSpinning = false;

  // Select control for clients and item families
  availableClients: Client[] = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  items: Item[] = [];
  listOfDisplayItems: Item[] = [];
  inventoryConfiguration?: InventoryConfiguration;

  // editable cell
  editId!: string | null;
  editCol!: string | null;

  searching = false;
  searchResult = '';

  threePartyLogisticsFlag = false;

  imageUploadDestination = '';
  uploadImageModal!: NzModalRef;
  uploadingImageItem!: Item;
  imageServerUrl = environment.api.baseUrl;
  imageUploading = false;
  uploadedImage = '';

   
  uploadWorkOrderSOPModal!: NzModalRef;
  uploadingWorkOrderSOPItem!: Item;  
  workOrderSOPUploading = false;
  workOrderSOPUploadUrl = '';
  uploadedWorkOrderSOP = "";
  
  addItemBarcodeForm!: UntypedFormGroup;
  addItemBarcodeModal!: NzModalRef;
  validItemBarcodeTypes: ItemBarcodeType[] = [];
  

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [];
  customColumns : { label: string, value: string; checked: boolean; }[] = [];
  setupItemTableColumns() {

    this.columns = [
      { title: this.i18n.fanyi("thumbnail"),  render: 'thumbnailColumn', iif: () => this.isChoose('thumbnail'), 
      },
      { title: this.i18n.fanyi("name"), index: 'name', iif: () => this.isChoose('name'), 
        sort: {
          compare: (a, b) => this.utilService.compareNullableString(a.name, b.name),
        },
      },
      { title: this.i18n.fanyi("description"), index: 'description', iif: () => this.isChoose('description'),   width: 200, 
        sort: {
          compare: (a, b) => this.utilService.compareNullableString(a.description, b.description),
        },
      }, 
      { title: this.i18n.fanyi("client"), index: 'client.name', iif: () => this.isChoose('client'), 
        sort: {
          compare: (a, b) =>  this.utilService.compareNullableString(a.client.name, b.client.name),
        },
      },
      { title: this.i18n.fanyi("item-family"), index: 'itemFamily.name', iif: () => this.isChoose('item-family'), 
        sort: {
          compare: (a, b) =>  this.utilService.compareNullableString(a.itemFamily.name, b.itemFamily.name),
        },
      },
      { title: this.i18n.fanyi("unit-cost"), index: 'unitCost', iif: () => this.isChoose('unit-cost'), 
        sort: {
          compare: (a, b) =>  this.utilService.compareNullableNumber(a.unitCost, b.unitCost),
        },
      },
      { title: this.i18n.fanyi("abc-category"), index: 'abcCategory.description', iif: () => this.isChoose('abcCategory'),
        sort: {
          compare: (a, b) =>  this.utilService.compareNullableString(a.abcCategory.description, b.abcCategory.description),
        },
      },
      { title: this.i18n.fanyi("velocity"), index: 'velocity.description', iif: () => this.isChoose('velocity'), 
        sort: {
          compare: (a, b) =>  this.utilService.compareNullableString(a.velocity.description, b.velocity.description),
        },
      },
      { title: this.i18n.fanyi("allowAllocationByLPN"), index: 'allowAllocationByLPN', iif: () => this.isChoose('allowAllocationByLPN'), 
           type:"yn"},
      { title: this.i18n.fanyi("allocationRoundUpStrategyType"), index: 'allocationRoundUpStrategyType', iif: () => this.isChoose('allocationRoundUpStrategyType'), },
      { title: this.i18n.fanyi("allocationRoundUpStrategyValue"), index: 'allocationRoundUpStrategyValue', iif: () => this.isChoose('allocationRoundUpStrategyValue'), },
      { title: this.i18n.fanyi("trackingVolumeFlag"), index: 'trackingVolumeFlag', iif: () => this.isChoose('trackingVolumeFlag'),
      type:"yn" },
      { title: this.i18n.fanyi("trackingLotNumberFlag"), index: 'trackingLotNumberFlag', iif: () => this.isChoose('trackingLotNumberFlag'), 
      type:"yn"},
      { title: this.i18n.fanyi("trackingManufactureDateFlag"), index: 'trackingManufactureDateFlag', iif: () => this.isChoose('trackingManufactureDateFlag'),
      type:"yn" },
      { title: this.i18n.fanyi("shelfLifeDays"), index: 'shelfLifeDays', iif: () => this.isChoose('shelfLifeDays'), },
      { title: this.i18n.fanyi("trackingExpirationDateFlag"), index: 'trackingExpirationDateFlag', iif: () => this.isChoose('trackingExpirationDateFlag'),
      type:"yn" },
      
      { title: this.i18n.fanyi("trackingColorFlag"), index: 'trackingColorFlag', iif: () => this.isChoose('trackingColorFlag'),
      type:"yn" },
      { title: this.i18n.fanyi("defaultColor"), index: 'defaultColor', iif: () => this.isChoose('defaultColor'), },
      { title: this.i18n.fanyi("trackingProductSizeFlag"), index: 'trackingProductSizeFlag', iif: () => this.isChoose('trackingProductSizeFlag'),
      type:"yn" },
      { title: this.i18n.fanyi("defaultProductSize"), index: 'defaultProductSize', iif: () => this.isChoose('defaultProductSize'), },
      { title: this.i18n.fanyi("trackingStyleFlag"), index: 'trackingStyleFlag', iif: () => this.isChoose('trackingStyleFlag'),
      type:"yn" },
      { title: this.i18n.fanyi("defaultStyle"), index: 'defaultStyle', iif: () => this.isChoose('defaultStyle')},
  
      { title: this.i18n.fanyi("trackingInventoryAttribute1Flag"), index: 'trackingInventoryAttribute1Flag', 
          iif: () => this.isChoose('trackingInventoryAttribute1Flag') && this.inventoryConfiguration?.inventoryAttribute1Enabled == true, 
      type:"yn" },
      { title: this.i18n.fanyi("defaultInventoryAttribute1"), index: 'defaultInventoryAttribute1', 
          iif: () => this.isChoose('defaultInventoryAttribute1') && this.inventoryConfiguration?.inventoryAttribute1Enabled == true,
        }, 
      { title: this.i18n.fanyi("trackingInventoryAttribute2Flag"), index: 'trackingInventoryAttribute2Flag', 
          iif: () => this.isChoose('trackingInventoryAttribute2Flag') && this.inventoryConfiguration?.inventoryAttribute2Enabled == true,
      type:"yn" },
      { title: this.i18n.fanyi("defaultInventoryAttribute2"), index: 'defaultInventoryAttribute2', 
          iif: () => this.isChoose('defaultInventoryAttribute2') && this.inventoryConfiguration?.inventoryAttribute2Enabled == true,
        }, 
          
      { title: this.i18n.fanyi("trackingInventoryAttribute3Flag"), index: 'trackingInventoryAttribute3Flag', 
      iif: () => this.isChoose('trackingInventoryAttribute3Flag') && this.inventoryConfiguration?.inventoryAttribute3Enabled == true,
      type:"yn" },
      { title: this.i18n.fanyi("defaultInventoryAttribute3"), index: 'defaultInventoryAttribute3', 
          iif: () => this.isChoose('defaultInventoryAttribute3') && this.inventoryConfiguration?.inventoryAttribute3Enabled == true,
        }, 
      { title: this.i18n.fanyi("trackingInventoryAttribute4Flag"), index: 'trackingInventoryAttribute4Flag', 
      iif: () => this.isChoose('trackingInventoryAttribute4Flag') && this.inventoryConfiguration?.inventoryAttribute4Enabled == true,
      type:"yn" },
      { title: this.i18n.fanyi("defaultInventoryAttribute4"), index: 'defaultInventoryAttribute4', 
          iif: () => this.isChoose('defaultInventoryAttribute4') && this.inventoryConfiguration?.inventoryAttribute4Enabled == true,
        }, 
      { title: this.i18n.fanyi("trackingInventoryAttribute5Flag"), index: 'trackingInventoryAttribute5Flag', 
      iif: () => this.isChoose('trackingInventoryAttribute5Flag') && this.inventoryConfiguration?.inventoryAttribute5Enabled == true,
      type:"yn" },
      { title: this.i18n.fanyi("defaultInventoryAttribute5"), index: 'defaultInventoryAttribute5', 
          iif: () => this.isChoose('defaultInventoryAttribute5') && this.inventoryConfiguration?.inventoryAttribute5Enabled == true,
        }, 
     
      
      
      { title: this.i18n.fanyi("receivingRateByUnit"), render: 'receivingRateByUnitColumn', 
        iif: () => this.isChoose('receivingRateByUnit'), 
      },
      { title: this.i18n.fanyi("shippingRateByUnit"), render: 'shippingRateByUnitColumn', 
        iif: () => this.isChoose('shippingRateByUnit'), 
      },
      { title: this.i18n.fanyi("handlingRateByUnit"), render: 'handlingRateByUnitColumn', 
        iif: () => this.isChoose('handlingRateByUnit'), 
      },
  
      {
        title: 'action',
        renderTitle: 'actionColumnTitle',
        render: 'actionColumn',
        fixed: 'right',width: 110, 
        iif: () => !this.displayOnly
      },
    ];
    this.customColumns = [
  
      { label: this.i18n.fanyi("thumbnail"), value: 'thumbnail', checked: true },
      { label: this.i18n.fanyi("name"), value: 'name', checked: true },
      { label: this.i18n.fanyi("description"), value: 'description', checked: true },
      { label: this.i18n.fanyi("client"), value: 'client', checked: true },
      { label: this.i18n.fanyi("abc-category"), value: 'abcCategory', checked: true },
      { label: this.i18n.fanyi("velocity"), value: 'velocity', checked: true },
      { label: this.i18n.fanyi("item-family"), value: 'item-family', checked: true },
      { label: this.i18n.fanyi("unit-cost"), value: 'unit-cost', checked: true },
      { label: this.i18n.fanyi("allowAllocationByLPN"), value: 'allowAllocationByLPN', checked: true },
      { label: this.i18n.fanyi("allocationRoundUpStrategyType"), value: 'allocationRoundUpStrategyType', checked: true },
      { label: this.i18n.fanyi("allocationRoundUpStrategyValue"), value: 'allocationRoundUpStrategyValue', checked: true },
      { label: this.i18n.fanyi("trackingVolumeFlag"), value: 'trackingVolumeFlag', checked: true },
      { label: this.i18n.fanyi("trackingLotNumberFlag"), value: 'trackingLotNumberFlag', checked: true },
      { label: this.i18n.fanyi("trackingManufactureDateFlag"), value: 'trackingManufactureDateFlag', checked: true },
      { label: this.i18n.fanyi("shelfLifeDays"), value: 'shelfLifeDays', checked: true },
      { label: this.i18n.fanyi("trackingExpirationDateFlag"), value: 'trackingExpirationDateFlag', checked: true },
      { label: this.i18n.fanyi("trackingColorFlag"), value: 'trackingColorFlag', checked: true },
      { label: this.i18n.fanyi("defaultColor"), value: 'defaultColor', checked: true },
      { label: this.i18n.fanyi("trackingProductSizeFlag"), value: 'trackingProductSizeFlag', checked: true },
      { label: this.i18n.fanyi("defaultProductSize"), value: 'defaultProductSize', checked: true },
      { label: this.i18n.fanyi("trackingStyleFlag"), value: 'trackingStyleFlag', checked: true },
      { label: this.i18n.fanyi("defaultStyle"), value: 'defaultStyle', checked: true },
      
      { label: this.i18n.fanyi("trackingInventoryAttribute1Flag"), value: 'trackingInventoryAttribute1Flag', checked: true },
      { label: this.i18n.fanyi("defaultInventoryAttribute1"), value: 'defaultInventoryAttribute1', checked: true },
      { label: this.i18n.fanyi("trackingInventoryAttribute2Flag"), value: 'trackingInventoryAttribute2Flag', checked: true },
      { label: this.i18n.fanyi("defaultInventoryAttribute2"), value: 'defaultInventoryAttribute2', checked: true },
      { label: this.i18n.fanyi("trackingInventoryAttribute3Flag"), value: 'trackingInventoryAttribute3Flag', checked: true },
      { label: this.i18n.fanyi("defaultInventoryAttribute3"), value: 'defaultInventoryAttribute3', checked: true },
      { label: this.i18n.fanyi("trackingInventoryAttribute4Flag"), value: 'trackingInventoryAttribute4Flag', checked: true },
      { label: this.i18n.fanyi("defaultInventoryAttribute4"), value: 'defaultInventoryAttribute4', checked: true },
      { label: this.i18n.fanyi("trackingInventoryAttribute5Flag"), value: 'trackingInventoryAttribute5Flag', checked: true },
      { label: this.i18n.fanyi("defaultInventoryAttribute5"), value: 'defaultInventoryAttribute5', checked: true },
  
      { label: this.i18n.fanyi("receivingRateByUnit"), value: 'receivingRateByUnit', checked: true },
      { label: this.i18n.fanyi("shippingRateByUnit"), value: 'shippingRateByUnit', checked: true },
      { label: this.i18n.fanyi("handlingRateByUnit"), value: 'handlingRateByUnit', checked: true },
    ];
  }

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{
    
    if (this.st != null && this.st.columns != null) {
      this.st.resetColumns({ emitReload: true });

    }
  }

  
  @ViewChild('kitInnerItemTable', { static: true })
  kitInnerItemTable!: STComponent;
  kitInnerItemTableColumn: STColumn[] = [    
    { title: this.i18n.fanyi("name"), render: 'kitInnerItemColumn', 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.item.name, b.item.name),
      },
    },
    { title: this.i18n.fanyi("description"), index: 'description',  
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.item.description, b.item.description),
      },
    }, 
    { title: this.i18n.fanyi("client"), index: 'client.name',  
      sort: {
        compare: (a, b) =>  this.utilService.compareNullableString(a.item.client.name, b.item.client.name),
      },
    },
    { title: this.i18n.fanyi("item-family"), index: 'itemFamily.name', 
      sort: {
        compare: (a, b) =>  this.utilService.compareNullableString(a.item.itemFamily.name, b.item.itemFamily.name),
      },
    },
    { title: this.i18n.fanyi("kit-quantity"), render: 'kitQuantityColumn',
      sort: {
        compare: (a, b) =>  this.utilService.compareNullableString(a.item.itemFamily.name, b.item.itemFamily.name),
      },
    },
    { title: this.i18n.fanyi("line-quantity"), index: 'expectedQuantity', 
      sort: {
        compare: (a, b) =>  this.utilService.compareNullableString(a.expectedQuantity, b.expectedQuantity),
      },
    },

  ];


  fallbackImage =
    'data:image/png;base64,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';

    displayOnly = false;
    userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
      ['modify-item', false],
      ['remove-item', false],
      ['upload-item', false],
      ['upload-item-unit-of-measure', false],
      ['add-item', false], 
    ]);
  constructor(
    private fb: UntypedFormBuilder,
    private itemService: ItemService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private unitService: UnitService,
    private localCacheService: LocalCacheService,
    private warehouseService: WarehouseService,
    private userService: UserService,
    private itemBarcodeService: ItemBarcodeService,
    private inventoryConfigurationService: InventoryConfigurationService,
  ) {
    userService.isCurrentPageDisplayOnly("/inventory/item").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );
    userService.getUserPermissionByWebPage("/inventory/item").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    }); 
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        } 
        this.setupItemTableColumns();
      } , 
      error: () =>  this.setupItemTableColumns()
    });
  
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.item'));
    // initiate the search form
    this.searchForm = this.fb.group({
      clientId: [null],
      taggedItemFamilies: [null],
      itemName: [null],
      itemDescription: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {
        this.searchForm.value.itemName.setValue(params['name']);
        this.search();
      }
    });

    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily => this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }));
    });
    
    // console.log(`imageServerUrl: ${this.imageServerUrl}`);

    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        }
        
      },
    });
    this.localCacheService.getItemBarcodeTypes().subscribe({
      next: (itemBarcodeTypeRes) => {
        this.validItemBarcodeTypes = itemBarcodeTypeRes;
      }
    });

  }

  resetForm(): void {
    this.searchForm.reset();
    this.items = [];
    this.listOfDisplayItems = [];
  }
  search(): void {
    this.isSpinning = true; 
    this.itemService
      .getItems(this.searchForm.value.itemName, undefined, this.searchForm.value.taggedItemFamilies, 
        undefined,undefined, this.searchForm.value.clientId, 
        this.searchForm.value.itemDescription)
      .subscribe({
          next: (itemRes) => {

            this.items = itemRes;
            this.items.filter(item => item.imageUrl).forEach(
              item =>  {
                item.image = 
                  `${environment.api.baseUrl}inventory/items/${item.id}/image?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&download=false`
                 
              }
            );
            this.items.filter(item => item.workOrderSOPUrl).forEach(
              item =>  {
                item.workOrderSOP = 
                  `${environment.api.baseUrl}inventory/items/${item.id}/work-order-sop?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&download=false`
                 
              }
            );
            this.listOfDisplayItems = itemRes;
  
            this.isSpinning = false;
  
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: itemRes.length
            });
          }, 
          error: () => {
            this.isSpinning = false;
            this.searchResult = '';
          }


      }); 
  }

  
  itemTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.loadUnit(event.expand);
    }

  }
  loadUnit(item: Item) : void {
    // backwards compatibility, in case the unit of the width / length / height
    // and weight is not setup yet. we will load the default unit
    item.itemPackageTypes.forEach(
      itemPackageType => {
        itemPackageType.itemUnitOfMeasures.forEach(
          itemUnitOfMeasure => {
            if (!itemUnitOfMeasure.lengthUnit) {
              this.loadLengthUnit(itemUnitOfMeasure, "lengthUnit");

            }
            if (!itemUnitOfMeasure.widthUnit) {
              this.loadLengthUnit(itemUnitOfMeasure, "widthUnit");

            }
            if (!itemUnitOfMeasure.heightUnit) {
              this.loadLengthUnit(itemUnitOfMeasure, "heightUnit");

            }
            if (!itemUnitOfMeasure.weightUnit) {
              this.loadWeightUnit(itemUnitOfMeasure, "weightUnit");

            }
          }
        )
      }
    )
  }

  loadLengthUnit(obj: any, key: string) {
    this.loadUnitByType(obj, key, UnitType.LENGTH) 
  }
  loadWeightUnit(obj: any, key: string) {
    this.loadUnitByType(obj, key, UnitType.WEIGHT) 
  }
  
  loadUnitByType(obj: any, key: string, unitType: UnitType) {
    this.unitService.loadUnits().subscribe({
      next: (unitsRes) => {
        unitsRes.forEach(
          unit => {
            if (unit.type === unitType && unit.baseUnitFlag === true) {
              obj[key] = unit.name; 
            }
          }
        )
      }
    })    
  }

  currentPageDataChange($event: Item[]): void {
    this.listOfDisplayItems = $event;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  showItemPackageType(item: Item): void {
    // When we expand to show the item package type, load the details of the item package type
  }

  removeItem(item: Item): void {
    // make sure we have at least one checkbox checked

    this.modalService.confirm({
      nzTitle: this.i18n.fanyi('modal.delete.header.title'),
      nzContent: this.i18n.fanyi('modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkDanger: true,
      nzOnOk: () => {
        this.itemService.removeItem(item).subscribe(res => {
          this.messageService.success(this.i18n.fanyi('message.remove.success'));
          this.search();
        });
      },
      nzCancelText: this.i18n.fanyi('cancel'),
      nzOnCancel: () => console.log('Cancel')
    });
  }
  /**
   * 
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
   */

  openImageViewer(item: Item, tplUploadImagesModalTitle: TemplateRef<{}>, tplUploadImagesModalContent: TemplateRef<{}>): void {
    this.uploadingImageItem = item;
    this.imageUploadDestination = `inventory/items/${item.id}/images/upload`;
    // show the model
    this.uploadedImage = '';
    this.uploadImageModal = this.modalService.create({
      nzTitle: tplUploadImagesModalTitle,
      nzContent: tplUploadImagesModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.uploadImageModal.destroy();
        // refresh after cancel
        this.search();
      },
      nzOnOk: () => {
        this.uploadImageModal.destroy();
        // refresh after cancel
        this.search();
      },
      nzWidth: 1000
    });
  }

  openWorkOrderSOPUploadModel(item: Item, tplUploadWorkOrderSOPModalTitle: TemplateRef<{}>, 
    tplUploadWorkOrderSOPModalContent: TemplateRef<{}>): void {

    this.uploadingWorkOrderSOPItem = item;
    this.workOrderSOPUploadUrl = `inventory/items/${item.id}/work-order-sop/upload`;
    
    this.uploadWorkOrderSOPModal = this.modalService.create({
      nzTitle: tplUploadWorkOrderSOPModalTitle,
      nzContent: tplUploadWorkOrderSOPModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.uploadWorkOrderSOPModal.destroy();
        // refresh after cancel
        this.search();
      },
      nzOnOk: () => {
        this.uploadWorkOrderSOPModal.destroy();
        // refresh after cancel
        this.search();
      },
      nzWidth: 1000
    });
  }

  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]) => {
    return new Observable((observer: Observer<boolean>) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        this.messageService.error('You can only upload JPG file!');
        observer.complete();
        return;
      }
      const isLt10M = file.size! / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.messageService.error('Image must smaller than 10MB!');
        observer.complete();
        return;
      }
      observer.next(isJpgOrPng && isLt10M);
      observer.complete();
    });
  };

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: NzUploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.imageUploading = true;
        break;
      case 'done':
        this.messageService.success(`${info.file.name} file uploaded successfully`);
        // Get this url from response in real world.
        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.imageUploading = false;
          this.uploadedImage = img;
        });
        break;
      case 'error':
        this.messageService.error(`${info.file.name} file upload failed.`);
        this.imageUploading = false;
        break;
    }
  }
  
  handleWorkOrderSOPUpload(info: { file: NzUploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.workOrderSOPUploading = true;
        break;
      case 'done':
        this.messageService.success(`${info.file.name} file uploaded successfully`);
        // Get this url from response in real world.
        this.getBase64(info.file!.originFileObj!, (file: string) => {
          this.workOrderSOPUploading = false;
          this.uploadedWorkOrderSOP = file;
        });
        break;
      case 'error':
        this.messageService.error(`${info.file.name} file upload failed.`);
        this.workOrderSOPUploading = false;
        break;
    }
  }



  processItemOverride(itemId?: number) {
    this.isSpinning = true;
    this.itemService.processItemOverride(itemId).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    })
  }

   
  
  barcodeTableColumns: STColumn[] = [ 
    
    { title: this.i18n.fanyi("code"),  index: 'code'   }, 
    { title: this.i18n.fanyi("type"),  index: 'itemBarcodeType.name'   },  
    {
      title: this.i18n.fanyi("action"),  
      buttons: [ 
        {
          text: this.i18n.fanyi("remove"),  
          type: 'link',
          click: (_record) => this.removeBarcodeType(_record),
        }
      ],  
    }
  ]; 

  removeBarcodeType(itemBarcode: ItemBarcode) {

    this.isSpinning = true;
    this.itemBarcodeService.removeItemBarcode(itemBarcode.id!).subscribe({

      next: () => {
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    })
  }

  openAddItemBarcodeModal( 
    item: Item,
    tplAddItemBarcodeModalTitle: TemplateRef<{}>,
    tplAddItemBarcodeModalContent: TemplateRef<{}>, 
  ): void {
    
    this.addItemBarcodeForm = this.fb.group({ 
      code: [null],
      type: [null], 
    });
 
    this.addItemBarcodeModal = this.modalService.create({
      nzTitle: tplAddItemBarcodeModalTitle,
      nzContent: tplAddItemBarcodeModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addItemBarcodeModal.destroy(); 
      },
      nzOnOk: () => {
        this.addItemBarcode( 
          item,
          this.addItemBarcodeForm.value.code.value,
          this.addItemBarcodeForm.value.type.value,
        );
        return false;
      },

      nzWidth: 1000,
    });
  }

  addItemBarcode(item: Item,code: string, type: ItemBarcodeType) {
    const itemBarcode : ItemBarcode = { 
      warehouseId: this.warehouseService.getCurrentWarehouse().id, 
    
      code: code,
      itemBarcodeType: type,
    }
    this.itemService.addItemBarcode(item.id!, itemBarcode)
    .subscribe({
      next: () => {
        this.addItemBarcodeModal.destroy(); 
        this.search();
      }
      
    })
  }
}
