import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { I18NService } from '@core';
import { ProductionPlanService } from '../services/production-plan.service';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderLineService } from '../../outbound/services/order-line.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { ItemService } from '../../inventory/services/item.service';
import { BillOfMaterialLine } from '../models/bill-of-material-line';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { WorkOrderInstructionTemplate } from '../models/work-order-instruction-template';
import { BillOfMaterialByProduct } from '../models/bill-of-material-by-product';

@Component({
  selector: 'app-work-order-bill-of-material-maintenance',
  templateUrl: './bill-of-material-maintenance.component.html',
  styleUrls: ['./bill-of-material-maintenance.component.less'],
})
export class WorkOrderBillOfMaterialMaintenanceComponent implements OnInit {
  pageTitle: string;
  stepIndex: number;
  currentBillOfMaterial: BillOfMaterial;
  mapOfNewLineExpectedQuantity: { [key: string]: number } = {};
  mapOfNewByProductExpectedQuantity: { [key: string]: number } = {};
  validItemNames: string[];

  availableInventoryStatuses: InventoryStatus[];
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private productionPlanService: ProductionPlanService,
    private messageService: NzMessageService,
    private router: Router,
    private orderLineService: OrderLineService,
    private warehouseService: WarehouseService,
    private billOfMeasureService: BillOfMaterialService,
    private inventoryStatusService: InventoryStatusService,
    private itemService: ItemService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.production-plan.new');
  }

  ngOnInit() {
    this.pageTitle = this.i18n.fanyi('page.production-plan.new');
    this.titleService.setTitle(this.i18n.fanyi('page.production-plan.new'));
    this.stepIndex = 0;

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.billOfMeasureService.getBillOfMaterial(params.id).subscribe(billOfMaterailRes => {
          this.currentBillOfMaterial = billOfMaterailRes;
          billOfMaterailRes.billOfMaterialLines.forEach(bomLine => {
            // Default to the original quantity. So by default, we won't change the
            // work order line quantity
            this.mapOfNewLineExpectedQuantity[bomLine.number] = bomLine.expectedQuantity;
          });
          billOfMaterailRes.billOfMaterialByProducts.forEach(byProduct => {
            // Default to the original quantity. So by default, we won't change the
            // work order line quantity
            this.mapOfNewByProductExpectedQuantity[byProduct.itemId] = byProduct.expectedQuantity;
          });
        });
      } else {
        // ID is not in the url, which probably means we are adding a new BOM
        this.currentBillOfMaterial = this.getEmptyBillOfMaterial();
      }
    });

    this.initialItemList();
    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }

  initialItemList() {
    this.validItemNames = [];
    this.itemService.getItems().subscribe(itemsRes => {
      itemsRes.forEach(item => {
        this.validItemNames.push(item.name);
      });
    });
  }
  previousStep() {
    this.stepIndex -= 1;
  }
  nextStep() {
    this.stepIndex += 1;
  }

  confirm() {
    this.setupBillOfMaterialQuantity();

    // Save a new bill of material or update an existing bill of material
    if (this.currentBillOfMaterial.id !== null) {
      this.billOfMeasureService.changeBillOfMaterial(this.currentBillOfMaterial).subscribe(billOfMaterialRes => {
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        setTimeout(() => {
          this.router.navigateByUrl(`/work-order/bill-of-material?number=${this.currentBillOfMaterial.number}`);
        }, 2500);
      });
    } else {
      this.billOfMeasureService.addBillOfMaterial(this.currentBillOfMaterial).subscribe(billOfMaterialRes => {
        this.messageService.success(this.i18n.fanyi('message.create.complete'));
        setTimeout(() => {
          this.router.navigateByUrl(`/work-order/bill-of-material?number=${this.currentBillOfMaterial.number}`);
        }, 2500);
      });
    }
  }

  // save the changed quantity to the
  // BOM
  // BOM Line
  // By Product
  setupBillOfMaterialQuantity() {
    this.currentBillOfMaterial.billOfMaterialLines.forEach(
      billOfMaterialLine =>
        (billOfMaterialLine.expectedQuantity = this.mapOfNewLineExpectedQuantity[billOfMaterialLine.number]),
    );
    this.currentBillOfMaterial.billOfMaterialByProducts.forEach(
      byProduct => (byProduct.expectedQuantity = this.mapOfNewByProductExpectedQuantity[byProduct.itemId]),
    );
  }
  // Bill Of Material related function
  billOfMaterialNumberOnBlur(billOfMaterialNumber: string) {
    this.currentBillOfMaterial.number = billOfMaterialNumber;
  }
  itemNameOnBlur(itemName: string) {
    console.log(`Item of BOM change to ${itemName}`);
    if (itemName === '') {
      this.currentBillOfMaterial.itemId = null;
      this.currentBillOfMaterial.item = {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        itemPackageTypes: [],

        allowCartonization: null,
        client: null,
        itemFamily: null,
        unitCost: null,

        allowAllocationByLPN: null,
        allocationRoundUpStrategyType: null,

        allocationRoundUpStrategyValue: null,

        trackingVolumeFlag: null,
        trackingLotNumberFlag: null,
        trackingManufactureDateFlag: null,
        shelfLifeDays: null,
        trackingExpirationDateFlag: null,
      };
    } else {
      this.itemService.getItems(itemName).subscribe(itemRes => {
        if (itemRes.length > 0) {
          // we should only get one item in the return
          // as the name is the business key
          this.currentBillOfMaterial.itemId = itemRes[0].id;
          this.currentBillOfMaterial.item = itemRes[0];
          console.log(`Item of BOM set to ${this.currentBillOfMaterial.item.name}`);
        }
      });
    }
  }
  getEmptyBillOfMaterial(): BillOfMaterial {
    return {
      id: null,
      number: null,
      description: null,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: this.warehouseService.getCurrentWarehouse(),
      billOfMaterialLines: [],
      workOrderInstructionTemplates: [],
      billOfMaterialByProducts: [],

      itemId: null,
      item: {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: null,

        client: null,
        itemFamily: null,
        unitCost: null,

        allowAllocationByLPN: null,
        allocationRoundUpStrategyType: null,

        allocationRoundUpStrategyValue: null,

        trackingVolumeFlag: null,
        trackingLotNumberFlag: null,
        trackingManufactureDateFlag: null,
        shelfLifeDays: null,
        trackingExpirationDateFlag: null,
      },
      expectedQuantity: 0,
    };
  }

  // BOM Line related functions
  bomLineItemNameChanged(itemName: string, billOfMaterialLine: BillOfMaterialLine) {
    console.log(`Item of billOfMaterialLine change to ${itemName}`);
    if (itemName === '') {
      billOfMaterialLine.itemId = null;
      billOfMaterialLine.item = {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: null,

        client: null,
        itemFamily: null,
        unitCost: null,

        allowAllocationByLPN: null,
        allocationRoundUpStrategyType: null,

        allocationRoundUpStrategyValue: null,

        trackingVolumeFlag: null,
        trackingLotNumberFlag: null,
        trackingManufactureDateFlag: null,
        shelfLifeDays: null,
        trackingExpirationDateFlag: null,
      };
    } else {
      this.itemService.getItems(itemName).subscribe(itemsRes => {
        itemsRes.forEach(item => {
          billOfMaterialLine.itemId = item.id;
          billOfMaterialLine.item = item;
        });
      });
    }
  }
  removeBOMLine(billOfMaterialLine: BillOfMaterialLine) {
    this.mapOfNewLineExpectedQuantity[billOfMaterialLine.number] = 0;
    this.currentBillOfMaterial.billOfMaterialLines = this.currentBillOfMaterial.billOfMaterialLines.filter(
      existingBillOfMaterialLine => existingBillOfMaterialLine.number !== billOfMaterialLine.number,
    );
  }
  inventoryStatusChange(newInventoryStatusName, billOfMaterialLine: BillOfMaterialLine) {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        billOfMaterialLine.inventoryStatus = inventoryStatus;
        billOfMaterialLine.inventoryStatusId = inventoryStatus.id;
      }
    });
  }

  addNewBOMLine() {
    this.currentBillOfMaterial.billOfMaterialLines = [
      ...this.currentBillOfMaterial.billOfMaterialLines,
      this.getEmptyBillOfMaterialLine(),
    ];
  }

  getNextLineNumber(): string {
    let maxLineNumber = 0;
    this.currentBillOfMaterial.billOfMaterialLines.forEach(billOfMaterialLine => {
      if (!isNaN(Number(billOfMaterialLine.number)) && maxLineNumber <= Number(billOfMaterialLine.number)) {
        maxLineNumber = Number(billOfMaterialLine.number) + 1;
      }
    });
    return maxLineNumber + '';
  }
  getEmptyBillOfMaterialLine(): BillOfMaterialLine {
    return {
      id: null,
      number: this.getNextLineNumber(),
      billOfMaterial: null,

      itemId: null,
      item: {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        itemPackageTypes: [],

        client: null,
        itemFamily: null,
        unitCost: null,

        allowCartonization: null,
        allowAllocationByLPN: null,
        allocationRoundUpStrategyType: null,

        allocationRoundUpStrategyValue: null,

        trackingVolumeFlag: null,
        trackingLotNumberFlag: null,
        trackingManufactureDateFlag: null,
        shelfLifeDays: null,
        trackingExpirationDateFlag: null,
      },
      expectedQuantity: 0,

      inventoryStatusId: null,
      inventoryStatus: null,
    };
  }

  // Working Instruction Template related functions
  removeInstructionTemplate(workOrderInstructionTemplate: WorkOrderInstructionTemplate) {
    this.currentBillOfMaterial.workOrderInstructionTemplates = this.currentBillOfMaterial.workOrderInstructionTemplates.filter(
      existingInstructionTemplate => existingInstructionTemplate.sequence !== workOrderInstructionTemplate.sequence,
    );
  }
  addNewInstructionTemplate() {
    this.currentBillOfMaterial.workOrderInstructionTemplates = [
      ...this.currentBillOfMaterial.workOrderInstructionTemplates,
      this.getEmptyInstructionTemplate(),
    ];
  }
  getEmptyInstructionTemplate(): WorkOrderInstructionTemplate {
    return {
      id: null,

      billOfMaterial: null,
      sequence: this.getNextInstructionTemplateSequence(),
      instruction: '',
    };
  }

  getNextInstructionTemplateSequence(): number {
    let maxSequence = 0;
    this.currentBillOfMaterial.workOrderInstructionTemplates.forEach(instructionTemplate => {
      if (!isNaN(Number(instructionTemplate.sequence)) && maxSequence <= Number(instructionTemplate.sequence)) {
        maxSequence = Number(instructionTemplate.sequence) + 1;
      }
    });
    return maxSequence;
  }

  // By Product related functions
  byProductItemNameChanged(itemName: string, byProduct: BillOfMaterialByProduct) {
    console.log(`Item of BOM change to ${itemName}`);
    if (itemName === '') {
      byProduct.itemId = null;
      byProduct.item = {
        id: null,

        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        itemPackageTypes: [],

        client: null,
        itemFamily: null,
        unitCost: null,
        allowCartonization: null,

        allowAllocationByLPN: null,
        allocationRoundUpStrategyType: null,

        allocationRoundUpStrategyValue: null,

        trackingVolumeFlag: null,
        trackingLotNumberFlag: null,
        trackingManufactureDateFlag: null,
        shelfLifeDays: null,
        trackingExpirationDateFlag: null,
      };
    } else {
      this.itemService.getItems(itemName).subscribe(itemsRes => {
        itemsRes.forEach(item => {
          byProduct.itemId = item.id;
          byProduct.item = item;
        });
      });
    }
  }
  byProductInventoryStatusChange(newInventoryStatusName: string, byProduct: BillOfMaterialByProduct) {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        byProduct.inventoryStatus = inventoryStatus;
        byProduct.inventoryStatusId = inventoryStatus.id;
      }
    });
  }
  removeByProduct(byProduct: BillOfMaterialByProduct) {
    this.currentBillOfMaterial.billOfMaterialByProducts = this.currentBillOfMaterial.billOfMaterialByProducts.filter(
      existingByProduct => {
        if (existingByProduct.itemId !== null && byProduct.itemId !== null) {
          return existingByProduct.itemId !== byProduct.itemId;
        } else {
          return existingByProduct.sequence !== byProduct.sequence;
        }
      },
    );
  }
  addNewByProduct() {
    this.currentBillOfMaterial.billOfMaterialByProducts = [
      ...this.currentBillOfMaterial.billOfMaterialByProducts,
      this.getEmptyByProduct(),
    ];
  }

  getEmptyByProduct(): BillOfMaterialByProduct {
    return {
      id: null,
      sequence: this.getNextByProductSequence(),
      itemId: null,
      item: {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: null,

        client: null,
        itemFamily: null,
        unitCost: null,

        allowAllocationByLPN: null,
        allocationRoundUpStrategyType: null,

        allocationRoundUpStrategyValue: null,

        trackingVolumeFlag: null,
        trackingLotNumberFlag: null,
        trackingManufactureDateFlag: null,
        shelfLifeDays: null,
        trackingExpirationDateFlag: null,
      },
      expectedQuantity: 0,

      inventoryStatusId: null,
      inventoryStatus: null,
    };
  }
  getNextByProductSequence(): number {
    let maxSequence = 0;
    this.currentBillOfMaterial.billOfMaterialByProducts.forEach(byProduct => {
      if (!isNaN(Number(byProduct.sequence)) && maxSequence <= Number(byProduct.sequence)) {
        maxSequence = Number(byProduct.sequence) + 1;
      }
    });
    return maxSequence;
  }
}
