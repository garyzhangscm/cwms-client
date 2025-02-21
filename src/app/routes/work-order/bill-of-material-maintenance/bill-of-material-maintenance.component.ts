import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { OrderLineService } from '../../outbound/services/order-line.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { BillOfMaterialByProduct } from '../models/bill-of-material-by-product';
import { BillOfMaterialLine } from '../models/bill-of-material-line';
import { WorkOrderInstructionTemplate } from '../models/work-order-instruction-template';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { ProductionPlanService } from '../services/production-plan.service';

@Component({
    selector: 'app-work-order-bill-of-material-maintenance',
    templateUrl: './bill-of-material-maintenance.component.html',
    styleUrls: ['./bill-of-material-maintenance.component.less'],
    standalone: false
})
export class WorkOrderBillOfMaterialMaintenanceComponent implements OnInit {
  pageTitle: string;
  stepIndex = 0;
  currentBillOfMaterial!: BillOfMaterial;
  mapOfNewLineExpectedQuantity: { [key: string]: number } = {};
  mapOfNewByProductExpectedQuantity: { [key: string]: number } = {};
  validItemNames: string[] = [];

  isSpinning = false;
  availableInventoryStatuses: InventoryStatus[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private productionPlanService: ProductionPlanService,
    private messageService: NzMessageService,
    private router: Router,
    private orderLineService: OrderLineService,
    private warehouseService: WarehouseService,
    private billOfMeasureService: BillOfMaterialService,
    private inventoryStatusService: InventoryStatusService,
    private companyService: CompanyService,

    private itemService: ItemService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.bill-of-material.new');
  }

  ngOnInit(): void {
    this.pageTitle = this.i18n.fanyi('page.bill-of-material.new');
    this.titleService.setTitle(this.i18n.fanyi('page.bill-of-material.new'));
    this.stepIndex = 0;

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.billOfMeasureService.getBillOfMaterial(params.id).subscribe(billOfMaterailRes => {
          this.currentBillOfMaterial = billOfMaterailRes;
          billOfMaterailRes.billOfMaterialLines.forEach(bomLine => {
            // Default to the original quantity. So by default, we won't change the
            // work order line quantity
            this.mapOfNewLineExpectedQuantity[bomLine.number!] = bomLine.expectedQuantity!;
          });
          billOfMaterailRes.billOfMaterialByProducts.forEach(byProduct => {
            // Default to the original quantity. So by default, we won't change the
            // work order line quantity
            this.mapOfNewByProductExpectedQuantity[byProduct.itemId!] = byProduct.expectedQuantity;
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

  initialItemList(): void {
    this.validItemNames = [];
    this.itemService.getItems().subscribe(itemsRes => {
      itemsRes.forEach(item => {
        this.validItemNames.push(item.name);
      });
    });
  }
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm(): void {
    this.isSpinning = true;
    this.setupBillOfMaterialQuantity();

    // Save a new bill of material or update an existing bill of material
    if (this.currentBillOfMaterial.id) {
      this.billOfMeasureService.changeBillOfMaterial(this.currentBillOfMaterial).subscribe(billOfMaterialRes => {
        setTimeout(() => {
          
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          this.router.navigateByUrl(`/work-order/bill-of-material?number=${this.currentBillOfMaterial.number}`);
        }, 500);
      });
    } else {
      this.billOfMeasureService.addBillOfMaterial(this.currentBillOfMaterial).subscribe(billOfMaterialRes => { 
        setTimeout(() => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.create.complete'));
          this.router.navigateByUrl(`/work-order/bill-of-material?number=${this.currentBillOfMaterial.number}`);
        }, 500);
      });
    }
  }

  // save the changed quantity to the
  // BOM
  // BOM Line
  // By Product
  setupBillOfMaterialQuantity(): void {
    this.currentBillOfMaterial.billOfMaterialLines.forEach(
      billOfMaterialLine =>
        (billOfMaterialLine.expectedQuantity = this.mapOfNewLineExpectedQuantity[billOfMaterialLine.number!]),
    );
    this.currentBillOfMaterial.billOfMaterialByProducts.forEach(
      byProduct => (byProduct.expectedQuantity = this.mapOfNewByProductExpectedQuantity[byProduct.itemId!]),
    );
  }
  // Bill Of Material related function
  billOfMaterialNumberOnBlur(event: Event): void {
    this.currentBillOfMaterial.number = (event.target as HTMLInputElement).value;
  }
  bomItemChanged(itemName: string): void {
    if (itemName.trim() === '') {
      this.currentBillOfMaterial.item = {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],

        allowCartonization: undefined,
        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      };
    } else {
      this.itemService.getItems(itemName.trim()).subscribe(itemRes => {
        if (itemRes.length > 0) {
          // we should only get one item in the return
          // as the name is the business key
          this.currentBillOfMaterial.itemId = itemRes[0].id!;
          this.currentBillOfMaterial.item = itemRes[0];
          console.log(`Item of BOM set to ${this.currentBillOfMaterial.item.name}`);
        }
        else {
          // if we can't find the item by name, then reset it to nothing
          
          this.currentBillOfMaterial.itemId = undefined;
          this.currentBillOfMaterial.item = {
            id: undefined,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            companyId: this.companyService.getCurrentCompany()!.id,
            name: '',
            description: '',
            itemPackageTypes: [],

            allowCartonization: undefined,
            client: undefined,
            itemFamily: undefined,
            unitCost: undefined,

            allowAllocationByLPN: undefined,
            allocationRoundUpStrategyType: undefined,

            allocationRoundUpStrategyValue: undefined,

            trackingVolumeFlag: undefined,
            trackingLotNumberFlag: undefined,
            trackingManufactureDateFlag: undefined,
            shelfLifeDays: undefined,
            trackingExpirationDateFlag: undefined,
          };
        }
      });
    }
  }
  itemNameOnBlur(event: Event): void {
    const itemName: string = (event.target as HTMLInputElement).value;
    console.log(`Item of BOM change to ${itemName.trim()}`);
    this.bomItemChanged(itemName);
    
  }
  processItemQueryResult(selectedItemName: any): void {
    console.log(`Item of BOM change to ${selectedItemName.trim()}`);
    this.bomItemChanged(selectedItemName);

  }
  getEmptyBillOfMaterial(): BillOfMaterial {
    return {
      id: undefined,
      number: undefined,
      description: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id, 
      warehouse: this.warehouseService.getCurrentWarehouse(),
      billOfMaterialLines: [],
      workOrderInstructionTemplates: [],
      billOfMaterialByProducts: [],

      itemId: undefined,
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: undefined,

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      expectedQuantity: 0,
    };
  }

  // BOM Line related functions
  bomLineItemNameOnBlur(event: Event, billOfMaterialLine: BillOfMaterialLine): void {
    const itemName: string = (event.target as HTMLInputElement).value.trim();
    console.log(`Item of billOfMaterialLine change to ${itemName}`);
    this.bomLineItemNameChanged(itemName, billOfMaterialLine);
  }
  bomLineItemNameChanged(itemName: string, billOfMaterialLine: BillOfMaterialLine): void { 
    if (itemName === '') {
      billOfMaterialLine.item = {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: undefined,

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      };
    } else {
      this.itemService.getItems(itemName).subscribe(itemsRes => {
        itemsRes.forEach(item => {
          billOfMaterialLine.itemId = item.id!;
          billOfMaterialLine.item = item;
        });
      });
    }
  }
  processBomLineItemQueryResult(itemName: any, billOfMaterialLine: BillOfMaterialLine ): void {
    
    this.bomLineItemNameChanged(itemName, billOfMaterialLine);
  }
  removeBOMLine(billOfMaterialLine: BillOfMaterialLine): void {
    this.mapOfNewLineExpectedQuantity[billOfMaterialLine.number!] = 0;
    this.currentBillOfMaterial.billOfMaterialLines = this.currentBillOfMaterial.billOfMaterialLines.filter(
      existingBillOfMaterialLine => existingBillOfMaterialLine.number !== billOfMaterialLine.number,
    );
  }
  inventoryStatusChange(newInventoryStatusName: string, billOfMaterialLine: BillOfMaterialLine): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        billOfMaterialLine.inventoryStatus = inventoryStatus;
        billOfMaterialLine.inventoryStatusId = inventoryStatus.id!;
      }
    });
  }

  addNewBOMLine(): void {
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
    return `${maxLineNumber  }`;
  }
  getEmptyBillOfMaterialLine(): BillOfMaterialLine {
    return {
      id: undefined,
      number: this.getNextLineNumber(),
      billOfMaterial: undefined,

      itemId: undefined,
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowCartonization: undefined,
        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      expectedQuantity: 0,

      inventoryStatusId: undefined,
      inventoryStatus: undefined,
    };
  }

  // Working Instruction Template related functions
  removeInstructionTemplate(workOrderInstructionTemplate: WorkOrderInstructionTemplate): void {
    this.currentBillOfMaterial.workOrderInstructionTemplates = this.currentBillOfMaterial.workOrderInstructionTemplates.filter(
      existingInstructionTemplate => existingInstructionTemplate.sequence !== workOrderInstructionTemplate.sequence,
    );
  }
  addNewInstructionTemplate(): void {
    this.currentBillOfMaterial.workOrderInstructionTemplates = [
      ...this.currentBillOfMaterial.workOrderInstructionTemplates,
      this.getEmptyInstructionTemplate(),
    ];
  }
  getEmptyInstructionTemplate(): WorkOrderInstructionTemplate {
    return {
      id: undefined,

      billOfMaterial: undefined,
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
  byProductItemNameChanged(event: Event, byProduct: BillOfMaterialByProduct): void {
    const itemName: string = (event.target as HTMLInputElement).value;
    console.log(`Item of BOM change to ${itemName}`);
    if (itemName === '') {
      byProduct.itemId = undefined;
      byProduct.item = {
        id: undefined,

        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,
        allowCartonization: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
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
  byProductInventoryStatusChange(newInventoryStatusName: string, byProduct: BillOfMaterialByProduct): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        byProduct.inventoryStatus = inventoryStatus;
        byProduct.inventoryStatusId = inventoryStatus.id;
      }
    });
  }
  removeByProduct(byProduct: BillOfMaterialByProduct): void {
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
  addNewByProduct(): void {
    this.currentBillOfMaterial.billOfMaterialByProducts = [
      ...this.currentBillOfMaterial.billOfMaterialByProducts,
      this.getEmptyByProduct(),
    ];
  }

  getEmptyByProduct(): BillOfMaterialByProduct {
    return {
      id: undefined,
      sequence: this.getNextByProductSequence(),
      itemId: undefined,
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: undefined,

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      expectedQuantity: 0,

      inventoryStatusId: undefined,
      inventoryStatus: undefined,
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
