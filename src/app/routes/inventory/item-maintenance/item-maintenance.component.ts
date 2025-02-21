import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { ABCCategory } from '../../common/models/abc-category';
import { Client } from '../../common/models/client';
import { Unit } from '../../common/models/unit';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitType } from '../../common/models/unit-type';
import { Velocity } from '../../common/models/velocity';
import { AbcCategoryService } from '../../common/services/abc-category.service';
import { ClientService } from '../../common/services/client.service';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { UnitService } from '../../common/services/unit.service';
import { VelocityService } from '../../common/services/velocity.service';
import { newItemUOMQuantityValidator } from '../../directives/newItemUOMQuantityValidator'; 
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
    standalone: false
})
export class InventoryItemMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentItem!: Item;
  newItem = true;
  
  validItemFamilies: ItemFamily[] = [];
  allocationRoundUpStrategyTypes = AllocationRoundUpStrategyType;
  lengthUnits: Unit[] = [];
  weightUnits: Unit[] = [];
  defaultLengthUnit?: Unit;
  defaultWeightUnit?: Unit;

  newUnitOfMeasureLengthUnit?: Unit;
  newUnitOfMeasureWidthUnit?: Unit;
  newUnitOfMeasureHeightUnit?: Unit;
  newUnitOfMeasureWeightUnit?: Unit;

  itemPackageTypesExpandSet = new Set<number>();
  mapOfRemovableItemPackageTypes: { [key: number]: boolean } = {};

  // All UOM maintained in the system
  availableUnitOfMeasures: UnitOfMeasure[] = [];
  // All UOMs that can be added to current item package type
  // we will skip the uom that already exists in the
  // current item package type
  availableUnitOfMeasuresForAdding: UnitOfMeasure[] = [];

  itemUOMForm!: UntypedFormGroup;
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
  availableClients: Client[] = [];
  availableVelocities: Velocity[] = [];
  availableABCCategories: ABCCategory[] = [];

  constructor(
    private fb: UntypedFormBuilder, 
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
    private clientService: ClientService,
    private utilService: UtilService,
    private unitService: UnitService,
    private abcCategoryService: AbcCategoryService,
    private velocityService: VelocityService,
  ) { 

    this.currentWarehouseName = warehouseService.getCurrentWarehouse().name;
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.itemService.getItem(params.id).subscribe(itemRes => {
          this.currentItem = itemRes;
          this.setupUnit(this.currentItem);
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

      
    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });
    this.abcCategoryService.loadABCCategories().subscribe({
      next: (abcCategoryRes) => this.availableABCCategories = abcCategoryRes
       
    });
    this.velocityService.loadVelocities().subscribe({
      next: (velocityRes) => this.availableVelocities = velocityRes
       
    });

    this.loadUnits();
  }

  loadUnits() {
    this.unitService.loadUnits().subscribe({
      next: (unitsRes) => {
        unitsRes.forEach(
          unit => {
            if (unit.type === UnitType.LENGTH) {
              this.lengthUnits.push(unit);
              if(unit.baseUnitFlag) {
                this.defaultLengthUnit = unit;
                console.log(`defaultLengthUnit: ${this.defaultLengthUnit?.name}`);
              }
            }
            else if (unit.type === UnitType.WEIGHT) {
              this.weightUnits.push(unit);
              if(unit.baseUnitFlag) {
                this.defaultWeightUnit = unit;
                console.log(`defaultWeightUnit: ${this.defaultWeightUnit?.name}`);
              }
            }
          }
        )
      }
    })    
  }

  
  setupUnit(item: Item) : void {
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
  

  loadMapOfRemovableItemPackageTypes(): void {
    this.currentItem.itemPackageTypes.forEach(itemPackageType => {
      console.log(`Check if ${itemPackageType?.name} is removable`);
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
      /**
       * 
      itemFamily: {
        name: '',
        description: '',
        warehouseId: isGlobalItem? undefined: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
      },
       */
      itemFamily: undefined,
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
    // console.log(`start to save item \n ${JSON.stringify(this.currentItem)}`);
    // console.log(`warehouse specific item \n ${JSON.stringify(this.warehouseSpecificItem)}`);
    // console.log(`company item \n ${JSON.stringify(this.companyItem)}`);

    if (this.currentItem.id != null) {
      this.isSpinning = true;
      this.itemService.changeItem(this.currentItem).subscribe({
        next: (itemRes) => {

          this.messageService.success(this.i18n.fanyi('message.item.changed'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/item?name=${itemRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
      
    } else {
      
      this.isSpinning = true;
      this.itemService.addItem(this.currentItem).subscribe({

        next: (itemRes) => {
          setTimeout(() => {
            this.messageService.success(this.i18n.fanyi('message.item.added'));
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/item?name=${itemRes.name}`);
          }, 500);

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
      itemPackageType: new UntypedFormControl({ value: this.currentItemPackageType.name, disabled: true }),

      unitOfMeasure: [null, Validators.required],
      quantity: [null, [Validators.required, newItemUOMQuantityValidator(this.currentItemPackageType)]],
      weight: [0, Validators.required],
      length: [0, Validators.required],
      width: [0, Validators.required],
      height: [0, Validators.required],
      defaultForInboundReceiving: [false, Validators.required],
      defaultForWorkOrderReceiving: [false, Validators.required],
      trackingLpnUOM: [false, Validators.required],
      defaultForDisplay: [false, Validators.required],
      caseFlag: [false, Validators.required],
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

    this.newUnitOfMeasureLengthUnit = this.defaultLengthUnit;
    this.newUnitOfMeasureWidthUnit = this.defaultLengthUnit;
    this.newUnitOfMeasureHeightUnit = this.defaultLengthUnit;
    this.newUnitOfMeasureWeightUnit = this.defaultWeightUnit;

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

  weightUnitSelected(unit: Unit) { 
    this.newUnitOfMeasureWeightUnit = unit;
  } 
  lengthUnitSelected(unit: Unit) { 
    this.newUnitOfMeasureLengthUnit = unit;
  } 
  widthUnitSelected(unit: Unit) { 
    this.newUnitOfMeasureWidthUnit = unit;
  } 
  heightUnitSelected(unit: Unit) { 
    this.newUnitOfMeasureHeightUnit = unit;
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
        this.itemUOMForm.controls.weight.value, this.newUnitOfMeasureWeightUnit!.name,
        this.itemUOMForm.controls.length.value, this.newUnitOfMeasureLengthUnit!.name,
        this.itemUOMForm.controls.width.value, this.newUnitOfMeasureWidthUnit!.name,
        this.itemUOMForm.controls.height.value, this.newUnitOfMeasureHeightUnit!.name, 
        this.itemUOMForm.controls.defaultForInboundReceiving.value,
        this.itemUOMForm.controls.defaultForWorkOrderReceiving.value,
        this.itemUOMForm.controls.trackingLpnUOM.value,
        this.itemUOMForm.controls.defaultForDisplay.value,
        this.itemUOMForm.controls.caseFlag.value,
      );

      this.itemUOMModal.destroy();
    } else {
      this.displayFormError(this.itemUOMForm);
    }
  }
  validateNewItemUOMQuantity(itemPackageType: ItemPackageType, itemUOMQuantity: number): boolean {
    return true;
  }
  displayFormError(fromGroup: UntypedFormGroup): void {
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
    weightUnit: string,
    length: number,
    lengthUnit: string,
    width: number,
    widthUnit: string,
    height: number,
    heightUnit: string,
    defaultForInboundReceiving: boolean,
    defaultForWorkOrderReceiving: boolean,
    trackingLpnUOM: boolean,
    defaultForDisplay: boolean,
    caseFlag: boolean,
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
              weight,weightUnit,
              length: length === null ? 0 : length, lengthUnit,
              width: width === null ? 0 : width, widthUnit,
              height: height === null ? 0 : height, heightUnit,
              defaultForInboundReceiving: defaultForInboundReceiving === null ? false : defaultForInboundReceiving,
              defaultForWorkOrderReceiving: defaultForWorkOrderReceiving === null ? false : defaultForWorkOrderReceiving,
              trackingLpn: trackingLpnUOM === null ? false : trackingLpnUOM,
              defaultForDisplay: defaultForDisplay === null ? false : defaultForDisplay,
              caseFlag: caseFlag === null ? false : caseFlag,
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

  clientChanged() {
    if (this.currentItem.clientId) {

      this.currentItem.client = this.availableClients.find(
        availableClient => availableClient.id === this.currentItem.clientId
      );
    }
    else {
      this.currentItem.client = undefined;
    }
  }
  
  velocityChanged() {
    if (this.currentItem.velocityId) {

      this.currentItem.velocity = this.availableVelocities.find(velocity => velocity.id == this.currentItem.velocityId)
    }
    else {
      this.currentItem.velocity = undefined;
    }
  }
  abcCategoryChanged() {
    if (this.currentItem.abcCategoryId) {

      this.currentItem.abcCategory = this.availableABCCategories.find(abcCategory => abcCategory.id == this.currentItem.abcCategoryId)
    }
    else {
      this.currentItem.abcCategory = undefined;
    }
  }
}
