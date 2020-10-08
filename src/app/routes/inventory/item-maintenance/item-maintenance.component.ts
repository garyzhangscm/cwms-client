import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService, NzModalRef, NzModalService } from 'ng-zorro-antd';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { newItemUOMQuantityValidator } from '../../directives/newItemUOMQuantityValidator';
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
  pageTitle: string;
  stepIndex: number;
  currentItem: Item;
  validItemFamilies: ItemFamily[];
  allocationRoundUpStrategyTypes = AllocationRoundUpStrategyType;

  mapOfExpandedItemPackageTypes: { [key: number]: boolean } = {};
  mapOfRemovableItemPackageTypes: { [key: number]: boolean } = {};

  // All UOM maintained in the system
  availableUnitOfMeasures: UnitOfMeasure[];
  // All UOMs that can be added to current item package type
  // we will skip the uom that already exists in the
  // current item package type
  availableUnitOfMeasuresForAdding: UnitOfMeasure[];

  itemUOMForm: FormGroup;
  itemUOMModal: NzModalRef;
  creatingItemUOMInProcess = false;
  // global variable. Setup when we are adding
  // UOM for the package type
  currentItemPackageType: ItemPackageType;

  constructor(
    private fb: FormBuilder,
    private http: _HttpClient,
    private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private router: Router,
    private itemService: ItemService,
    private activatedRoute: ActivatedRoute,
    private warehouseService: WarehouseService,
    private itemFamilyService: ItemFamilyService,
    private modalService: NzModalService,
    private unitOfMeasureService: UnitOfMeasureService,
    private itemPackageTypeService: ItemPackageTypeService,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.itemService.getItem(params.id).subscribe(itemRes => {
          this.currentItem = itemRes;

          this.titleService.setTitle(this.i18n.fanyi('page.item.maintenance.modify'));
          this.pageTitle = this.i18n.fanyi('page.item.maintenance.modify');
          this.loadMapOfRemovableItemPackageTypes();
        });
      } else {
        this.currentItem = this.getEmptyItem();
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

  loadMapOfRemovableItemPackageTypes() {
    this.currentItem.itemPackageTypes.forEach(itemPackageType => {
      console.log(`Check if ${itemPackageType.name} is removable`);
      this.itemPackageTypeService.isItemPackageTypeRemovable(itemPackageType.id).subscribe(removable => {
        this.mapOfRemovableItemPackageTypes[itemPackageType.id] = removable;

        console.log(` ${itemPackageType.name} is removable? : ${removable}`);
      });
    });
  }

  getEmptyItem(): Item {
    return {
      id: null,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      name: '',
      description: '',
      client: null,
      itemFamily: null,
      itemPackageTypes: [],
      unitCost: 0,
      allowCartonization: false,
      allowAllocationByLPN: false,
      allocationRoundUpStrategyType: null,

      allocationRoundUpStrategyValue: 0,

      trackingVolumeFlag: false,
      trackingLotNumberFlag: false,
      trackingManufactureDateFlag: false,
      shelfLifeDays: 0,
      trackingExpirationDateFlag: false,
    };
  }

  previousStep() {
    this.stepIndex -= 1;
  }
  nextStep() {
    this.stepIndex += 1;
  }
  confirmItem() {
    if (this.currentItem.id != null) {
      this.itemService.changeItem(this.currentItem).subscribe(itemRes => {
        this.messageService.success(this.i18n.fanyi('message.item.changed'));
        setTimeout(() => {
          this.router.navigateByUrl(`/inventory/item?name=${itemRes.name}`);
        }, 2500);
      });
    } else {
      this.itemService.addItem(this.currentItem).subscribe(itemRes => {
        this.messageService.success(this.i18n.fanyi('message.item.added'));
        setTimeout(() => {
          this.router.navigateByUrl(`/inventory/item?name=${itemRes.name}`);
        }, 2500);
      });
    }
  }

  itemFamilySelected(selectedItemFamilyId: number) {
    console.log(`item family ${selectedItemFamilyId} selected`);
  }
  allocationRoundUpStrategyTypeChanged(selectedAllocationRoundUpStrategyType: AllocationRoundUpStrategyType) {
    console.log(`AllocationRoundUpStrategyType: ${selectedAllocationRoundUpStrategyType} selected`);
  }
  createItemUOMForm() {
    this.itemUOMForm = this.fb.group({
      itemPackageType: new FormControl({ value: this.currentItemPackageType.name, disabled: true }),

      unitOfMeasure: [null, Validators.required],
      quantity: [null, [Validators.required, newItemUOMQuantityValidator(this.currentItemPackageType)]],
      weight: [0, Validators.required],
      length: [0, Validators.required],
      width: [0, Validators.required],
      height: [0, Validators.required],
    });
  }
  openAddingItemUnitOfMeasureModal(
    itemPackageType: ItemPackageType,
    tplItemUOMModalTitle: TemplateRef<{}>,
    tplItemUOMModalContent: TemplateRef<{}>,
    tplItemUOMModalFooter: TemplateRef<{}>,
  ) {
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

  closeItemUOMModal() {
    this.creatingItemUOMInProcess = false;
    this.itemUOMModal.destroy();
  }
  confirmItemUOM() {
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
      );

      this.itemUOMModal.destroy();
    } else {
      this.displayFormError(this.itemUOMForm);
    }
  }
  validateNewItemUOMQuantity(itemPackageType: ItemPackageType, itemUOMQuantity: number): boolean {
    return true;
  }
  displayFormError(fromGroup: FormGroup) {
    console.log(`validateForm`);
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
  get itemUOMQuantityControl() {
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
  ) {
    // Get the unit of measure first
    this.availableUnitOfMeasures
      .filter(unitOfMeasure => unitOfMeasure.name === unitOfMeasureName)
      .forEach(
        unitOfMeasure =>
          (itemPackageType.itemUnitOfMeasures = [
            ...itemPackageType.itemUnitOfMeasures,
            {
              unitOfMeasure,
              warehouseId: this.warehouseService.getCurrentWarehouse().id,
              unitOfMeasureId: unitOfMeasure === null ? null : unitOfMeasure.id,
              quantity,
              weight,
              length: length === null ? 0 : length,
              width: width === null ? 0 : width,
              height: height === null ? 0 : height,
            },
          ]),
      );
  }

  addItemPackageType() {
    this.currentItem.itemPackageTypes = [
      ...this.currentItem.itemPackageTypes,
      {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: null,
        description: null,
        itemUnitOfMeasures: [],
      },
    ];
  }

  removeItemPackageType(itemPackageTypeIndex: number) {
    if (this.currentItem.itemPackageTypes.length > itemPackageTypeIndex) {
      this.currentItem.itemPackageTypes = this.currentItem.itemPackageTypes.filter(
        (element, index) => index !== itemPackageTypeIndex,
      );
    }
  }
  removeItemUnitOfMeasure(itemPackageType: ItemPackageType, removedItemUnitOfMeasure: ItemUnitOfMeasure) {
    itemPackageType.itemUnitOfMeasures = itemPackageType.itemUnitOfMeasures.filter(
      itemUnitOfMeasure => itemUnitOfMeasure.unitOfMeasure.name !== removedItemUnitOfMeasure.unitOfMeasure.name,
    );
  }
  isItemPackageTypeRemovable(itemPackageType: ItemPackageType) {
    if (itemPackageType.id === null || this.mapOfRemovableItemPackageTypes[itemPackageType.id] === undefined) {
      return true;
    } else {
      return this.mapOfRemovableItemPackageTypes[itemPackageType.id];
    }
  }
}
