import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { newItemUOMQuantityValidator } from '../../directives/newItemUOMQuantityValidator';
import { ReportRoutingModule } from '../../report/report-routing.module';
import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationRoundUpStrategyType } from '../models/allocation-round-up-strategy-type.enum';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';
import { ItemPackageType } from '../models/item-package-type';
import { ItemUnitOfMeasure } from '../models/item-unit-of-measure';
import { ItemFamilyService } from '../services/item-family.service';
import { ItemPackageTypeService } from '../services/item-package-type.service';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-inventory-item-maintenance',
  templateUrl: './item-maintenance.component.html',
  styleUrls: ['./item-maintenance.component.less'],
})
export class InventoryItemMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentItem!: Item;
  newItem = true;
  
  validItemFamilies: ItemFamily[] = [];
  allocationRoundUpStrategyTypes = AllocationRoundUpStrategyType;

  itemPackageTypesExpandSet = new Set<number>();
  mapOfRemovableItemPackageTypes: { [key: number]: boolean } = {};

  // All UOM maintained in the system
  availableUnitOfMeasures: UnitOfMeasure[] = [];
  // All UOMs that can be added to current item package type
  // we will skip the uom that already exists in the
  // current item package type
  availableUnitOfMeasuresForAdding: UnitOfMeasure[] = [];

  itemUOMForm!: FormGroup;
  itemUOMModal!: NzModalRef;
  creatingItemUOMInProcess = false;
  // global variable. Setup when we are adding
  // UOM for the package type
  currentItemPackageType!: ItemPackageType;
  isSpinning = false;

  currentWarehouseName?: string;
  warehouseSpecific = "YES";
  companyItem?: Item;
  warehouseSpecificItem?: Item;

  constructor(
    private fb: FormBuilder,
    private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private router: Router,
    private itemService: ItemService,
    private activatedRoute: ActivatedRoute,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private itemFamilyService: ItemFamilyService,
    private modalService: NzModalService,
    private unitOfMeasureService: UnitOfMeasureService,
    private itemPackageTypeService: ItemPackageTypeService,
    private utilService: UtilService,
  ) { 

    this.currentWarehouseName = warehouseService.getCurrentWarehouse().name;
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.itemService.getItem(params.id).subscribe(itemRes => {
          this.currentItem = itemRes;
          this.newItem = false;
          if (this.currentItem.warehouseId) {            
               this.warehouseSpecific = "YES";
               this.warehouseSpecificItem = this.currentItem;
               this.companyItem = undefined;
          }
          else {
            // this is a global item
            this.warehouseSpecific = "NO";
            this.warehouseSpecificItem = undefined;
            this.companyItem = this.currentItem;
          }


          this.titleService.setTitle(this.i18n.fanyi('page.item.maintenance.modify'));
          this.pageTitle = this.i18n.fanyi('page.item.maintenance.modify');
          this.loadMapOfRemovableItemPackageTypes();
        });
      } else {
        this.warehouseSpecificItem = this.getEmptyItem(false);
        this.currentItem = this.warehouseSpecificItem;
        this.newItem = true;
        // By default, we will always create the item under specific warehouse
        this.warehouseSpecific = "YES";
        this.companyItem = undefined;
        this.titleService.setTitle(this.i18n.fanyi('page.item.maintenance.new'));
        this.pageTitle = this.i18n.fanyi('page.item.maintenance.new');
      }
    });

    this.stepIndex = 0;

    this.itemFamilyService.loadItemFamilies().subscribe(itemFamilyRes => (this.validItemFamilies = itemFamilyRes));
    this.unitOfMeasureService
      .loadUnitOfMeasures()
      .subscribe(unitOfMeasureRes => (this.availableUnitOfMeasures = unitOfMeasureRes));
  }

  loadMapOfRemovableItemPackageTypes(): void {
    this.currentItem.itemPackageTypes.forEach(itemPackageType => {
      console.log(`Check if ${itemPackageType.name} is removable`);
      this.itemPackageTypeService.isItemPackageTypeRemovable(itemPackageType.id!).subscribe(removable => {
        this.mapOfRemovableItemPackageTypes[itemPackageType.id!] = removable;

        console.log(` ${itemPackageType.name} is removable? : ${removable}`);
      });
    });
  }

  getEmptyItem(isGlobalItem: boolean): Item {
    return {
      id: undefined,
      warehouseId: isGlobalItem? undefined: this.warehouseService.getCurrentWarehouse().id,
      companyId: this.companyService.getCurrentCompany()!.id,
      name: '',
      description: '',
      client: undefined,
      itemFamily: {
        name: '',
        description: '',
        warehouseId: isGlobalItem? undefined: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
      },
      itemPackageTypes: [],
      unitCost: 0,
      allowCartonization: false,
      allowAllocationByLPN: false,
      allocationRoundUpStrategyType: undefined,

      allocationRoundUpStrategyValue: 0,

      trackingVolumeFlag: false,
      trackingLotNumberFlag: false,
      trackingManufactureDateFlag: false,
      shelfLifeDays: 0,
      trackingExpirationDateFlag: false,
    };
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }
  confirmItem(): void {
    console.log(`start to save item \n ${JSON.stringify(this.currentItem)}`);
    console.log(`warehouse specific item \n ${JSON.stringify(this.warehouseSpecificItem)}`);
    console.log(`company item \n ${JSON.stringify(this.companyItem)}`);

    if (this.currentItem.id != null) {
      this.isSpinning = true;
      this.itemService.changeItem(this.currentItem).subscribe({
        next: (itemRes) => {

          this.messageService.success(this.i18n.fanyi('message.item.changed'));
          this.isSpinning = false;
          setTimeout(() => {
            this.router.navigateByUrl(`/inventory/item?name=${itemRes.name}`);
          }, 2500);
        }, 
        error: () => this.isSpinning = false
      }); 
      
    } else {
      
      this.isSpinning = true;
      this.itemService.addItem(this.currentItem).subscribe({

        next: (itemRes) => {
          this.messageService.success(this.i18n.fanyi('message.item.added'));
          setTimeout(() => {
            this.router.navigateByUrl(`/inventory/item?name=${itemRes.name}`);
          }, 2500);

        }, 
        error: () => this.isSpinning = false 
      });
    }
  }

  itemFamilySelected(selectedItemFamilyId: number): void {
    console.log(`item family ${selectedItemFamilyId} selected`);
    this.validItemFamilies.filter(itemFamily => itemFamily.id === selectedItemFamilyId)
        .forEach(itemFamily => this.currentItem.itemFamily = itemFamily);
  }
  allocationRoundUpStrategyTypeChanged(selectedAllocationRoundUpStrategyType: AllocationRoundUpStrategyType): void {
    console.log(`AllocationRoundUpStrategyType: ${selectedAllocationRoundUpStrategyType} selected`);
  }
  createItemUOMForm(): void {
    this.itemUOMForm = this.fb.group({
      itemPackageType: new FormControl({ value: this.currentItemPackageType.name, disabled: true }),

      unitOfMeasure: [null, Validators.required],
      quantity: [null, [Validators.required, newItemUOMQuantityValidator(this.currentItemPackageType)]],
      weight: [0, Validators.required],
      length: [0, Validators.required],
      width: [0, Validators.required],
      height: [0, Validators.required],
      defaultForInboundReceiving: [false, Validators.required],
      defaultForWorkOrderReceiving: [false, Validators.required],
      trackingLpnUOM: [false, Validators.required],
    });
  }
  openAddingItemUnitOfMeasureModal(
    itemPackageType: ItemPackageType,
    tplItemUOMModalTitle: TemplateRef<{}>,
    tplItemUOMModalContent: TemplateRef<{}>,
    tplItemUOMModalFooter: TemplateRef<{}>,
  ): void {
    this.currentItemPackageType = itemPackageType;
    this.createItemUOMForm();
    this.creatingItemUOMInProcess = false;

    // load the available UOM
    // will only display the UOM when it is not in the item package type yet
    this.availableUnitOfMeasuresForAdding = this.availableUnitOfMeasures.filter(
      unitOfMeasure =>
        !itemPackageType.itemUnitOfMeasures.some(
          existingItemUnitOfMeasure => existingItemUnitOfMeasure.unitOfMeasureId === unitOfMeasure.id,
        ),
    );

    // Load the location
    this.itemUOMModal = this.modalService.create({
      nzTitle: tplItemUOMModalTitle,
      nzContent: tplItemUOMModalContent,
      nzFooter: tplItemUOMModalFooter,
      nzWidth: 1000,
    });
  }

  closeItemUOMModal(): void {
    this.creatingItemUOMInProcess = false;
    this.itemUOMModal.destroy();
  }
  confirmItemUOM(): void {
    this.creatingItemUOMInProcess = false;

    if (this.itemUOMForm.valid) {
      this.addItemUnitOfMeasure(
        this.currentItemPackageType,
        this.itemUOMForm.controls.unitOfMeasure.value,
        this.itemUOMForm.controls.quantity.value,
        this.itemUOMForm.controls.weight.value,
        this.itemUOMForm.controls.length.value,
        this.itemUOMForm.controls.width.value,
        this.itemUOMForm.controls.height.value,
        this.itemUOMForm.controls.defaultForInboundReceiving.value,
        this.itemUOMForm.controls.defaultForWorkOrderReceiving.value,
        this.itemUOMForm.controls.trackingLpnUOM.value,
      );

      this.itemUOMModal.destroy();
    } else {
      this.displayFormError(this.itemUOMForm);
    }
  }
  validateNewItemUOMQuantity(itemPackageType: ItemPackageType, itemUOMQuantity: number): boolean {
    return true;
  }
  displayFormError(fromGroup: FormGroup): void {
    console.log(`validateForm`);
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
  get itemUOMQuantityControl(): AbstractControl | null {
    return this.itemUOMForm.get('quantity');
  }

  addItemUnitOfMeasure(
    itemPackageType: ItemPackageType,
    unitOfMeasureName: string,
    quantity: number,
    weight: number,
    length: number,
    width: number,
    height: number,
    defaultForInboundReceiving: boolean,
    defaultForWorkOrderReceiving: boolean,
    trackingLpnUOM: boolean,
  ): void {
    // Get the unit of measure first
    this.availableUnitOfMeasures
      .filter(unitOfMeasure => unitOfMeasure.name === unitOfMeasureName)
      .forEach(
        unitOfMeasure => {
          itemPackageType.itemUnitOfMeasures = [
            ...itemPackageType.itemUnitOfMeasures,
            {
              unitOfMeasure,
              warehouseId: this.warehouseService.getCurrentWarehouse().id,
              companyId: this.companyService.getCurrentCompany()!.id,
              unitOfMeasureId: unitOfMeasure === null ? undefined : unitOfMeasure.id,
              quantity,
              weight,
              length: length === null ? 0 : length,
              width: width === null ? 0 : width,
              height: height === null ? 0 : height,
              defaultForInboundReceiving: defaultForInboundReceiving === null ? false : defaultForInboundReceiving,
              defaultForWorkOrderReceiving: defaultForWorkOrderReceiving === null ? false : defaultForWorkOrderReceiving,
              trackingLpn: trackingLpnUOM === null ? false : trackingLpnUOM,
            },
          ];
          itemPackageType.itemUnitOfMeasures.sort((a, b) => a.quantity! - b.quantity!);
        }
      );
  }

  addItemPackageType(): void {
    this.currentItem.itemPackageTypes = [
      ...this.currentItem.itemPackageTypes,
      {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: undefined,
        description: undefined,
        itemUnitOfMeasures: [],
      },
    ];
  }

  removeItemPackageType(itemPackageTypeIndex: number): void {
    if (this.currentItem.itemPackageTypes.length > itemPackageTypeIndex) {
      this.currentItem.itemPackageTypes = this.currentItem.itemPackageTypes.filter(
        (element, index) => index !== itemPackageTypeIndex,
      );
    }
  }
  removeItemUnitOfMeasure(itemPackageType: ItemPackageType, removedItemUnitOfMeasure: ItemUnitOfMeasure): void {
    itemPackageType.itemUnitOfMeasures = itemPackageType.itemUnitOfMeasures!.filter(
      itemUnitOfMeasure => itemUnitOfMeasure.unitOfMeasure!.name !== removedItemUnitOfMeasure.unitOfMeasure!.name,
    );
  }
  isItemPackageTypeRemovable(itemPackageType: ItemPackageType): boolean {
    if (itemPackageType.id === null || this.mapOfRemovableItemPackageTypes[itemPackageType.id!] === undefined) {
      return true;
    } else {
      return this.mapOfRemovableItemPackageTypes[itemPackageType.id!];
    }
  }
  onItemPackageTypesExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.itemPackageTypesExpandSet.add(id);
    } else {
      this.itemPackageTypesExpandSet.delete(id);
    }
  }
  warehouseSpecificOptionChanged() {
    if (this.warehouseSpecific === "NO" ) {
      // load the global item
      this.loadGlobalItem();
    }
    else {
      // load the warehouse specific item for current warehouse
      this.loadWarehouseSepcificItem();
    }
  }
  loadGlobalItem() {
    
    if (this.companyItem) {
      // we already initiate the company item, then point the 
      // current item to company item
      this.currentItem = this.companyItem;
      return;

    }
    if (this.newItem) {  
        this.companyItem = this.getEmptyItem(true);
        this.currentItem = this.companyItem; 
    }
    else { 
        this.isSpinning = true;
        // get the global item from the server
        // we should have the current item point to some existing item since we
        // are modifying existing item
        this.itemService.getItems(this.currentItem.name, undefined, undefined, true).subscribe(
          {
            next: (itemRes) => {

              if (itemRes.length === 1) {
                // we should at max have only one global item for a specific name
                this.companyItem = itemRes[0];
                this.currentItem = this.companyItem;
              }
              else if (itemRes.length === 0) {
                // we may not have any global item defined, then we will copy the warehouse
                // specific item 
                this.companyItem = this.utilService.cloneItem(this.warehouseSpecificItem!, false);
                this.currentItem = this.companyItem;
              }
              this.isSpinning = false;
            },
            error: () => this.isSpinning = false

          }
        ) 
    }
  } 
  loadWarehouseSepcificItem() {
    
    if (this.warehouseSpecificItem) {
      // we already initiate the global item, then point the 
      // current item to global item
      this.currentItem = this.warehouseSpecificItem;
      return;

    }
    if (this.newItem) {  
        this.warehouseSpecificItem = this.getEmptyItem(false);
        this.currentItem = this.warehouseSpecificItem; 
    }
    else { 
        this.isSpinning = true;
        // get the global item from the server
        // we should have the current item point to some existing item since we
        // are modifying existing item 
        this.itemService.getItems(this.currentItem.name, undefined, undefined, undefined, true).subscribe(
          {
            next: (itemRes) => {
 

              if (itemRes.length === 1) {
                // we should at max have only one warehouse specific item for a specific name
                this.warehouseSpecificItem = itemRes[0];
                this.currentItem = this.warehouseSpecificItem;
              }
              else if (itemRes.length === 0) {
                // we may not have any warehouse specific item defined, then we will copy the company
                // specific item 
                this.warehouseSpecificItem = this.utilService.cloneItem(this.companyItem!, true);
                this.currentItem = this.warehouseSpecificItem;
              }
              this.isSpinning = false;
            },
            error: () => this.isSpinning = false

          }
        ) 
    }
  } 
}
