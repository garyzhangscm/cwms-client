import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service'; 
import { OrderLine } from '../../outbound/models/order-line';
import { OrderLineService } from '../../outbound/services/order-line.service'; 
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { ProductionPlan } from '../models/production-plan';
import { ProductionPlanLine } from '../models/production-plan-line';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { ProductionPlanService } from '../services/production-plan.service';

@Component({
    selector: 'app-work-order-production-plan-maintenance',
    templateUrl: './production-plan-maintenance.component.html',
    styleUrls: ['./production-plan-maintenance.component.less'],
    standalone: false
})
export class WorkOrderProductionPlanMaintenanceComponent implements OnInit {

  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfOrderLineTableColumns: Array<ColumnItem<OrderLine>> = [
    {
      name: 'order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableString(a.orderNumber, b.orderNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.expectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.openQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.openQuantity, b.openQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.inprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.inprocessQuantity, b.inprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.shippedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.shippedQuantity, b.shippedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-plan.line.inprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.productionPlanInprocessQuantity, b.productionPlanInprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-plan.line.producedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.productionPlanProducedQuantity, b.productionPlanProducedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'inventory.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];


  listOfOrderLineTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onOrderLineTableAllChecked(true);
      }
    },
  ];
  setOfOrderLineTableCheckedId = new Set<number>();
  orderLineTableChecked = false;
  orderLineTableIndeterminate = false;

  pageTitle: string;
  stepIndex = 0;
  currentProductionPlan!: ProductionPlan;

  isSearchingOrder = false;
  isConfirming = false;

  mapOfExpandedId: { [key: string]: boolean } = {};
  mapOfExpandedBOMId: { [key: string]: boolean } = {};
  mapOfCheckedId: { [key: string]: boolean } = {};
  filterOrderNumber = '';
  filterItemName = '';
  validOrderLines: OrderLine[] = [];
  mapOfAvailableBillOfMaterial: { [key: string]: BillOfMaterial[] } = {};
  listOfValidBomItem: Item[] = [];
  availableInventoryStatuses: InventoryStatus[] = [];

  selectedBOM: { [key: string]: string } = {};

  constructor(
    private titleService: TitleService,
    private productionPlanService: ProductionPlanService,
    private messageService: NzMessageService,
    private router: Router,
    private orderLineService: OrderLineService,
    private warehouseService: WarehouseService,
    private billOfMeasureService: BillOfMaterialService,
    private inventoryStatusService: InventoryStatusService,
    private utilService: UtilService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.production-plan.new');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.production-plan.new'));

    this.currentProductionPlan = {
      id: undefined,
      number: undefined,
      description: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: this.warehouseService.getCurrentWarehouse(),
      expectedQuantity: 0,
      inprocessQuantity: 0,
      producedQuantity: 0,

      productionPlanLines: [],
    };

    this.stepIndex = 0;

    // load list of valid items with bom so that we can add
    // the item without any order line
    this.initListOfValidBomItems();

    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }
  initListOfValidBomItems(): void {
    this.listOfValidBomItem = [];
    this.billOfMeasureService.getBillOfMaterials().subscribe(bomRes => {
      bomRes.forEach(bom => {
        this.listOfValidBomItem.push(bom.item!);
      });
    });
  }

  onAllOrderLineChecked(checked: boolean): void {
    this.validOrderLines.forEach(orderLine => {
      const originalStatus = this.mapOfCheckedId[orderLine.id!];
      this.mapOfCheckedId[orderLine.id!] = checked;
      if (originalStatus !== checked) {
        // checked status is changed. let's
        // call the function selectedOrderLineChange which will
        // load the valid for the selected order lines
        // or remove the BOM for those unselected order lines
        this.selectedOrderLineChange(checked, orderLine);
      }
    });
    this.refreshOrderLineTableCheckedStatus();
  }

  updateOrderLineTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfOrderLineTableCheckedId.add(id);
    } else {
      this.setOfOrderLineTableCheckedId.delete(id);
    }
  }

  onOrderLineTableItemChecked(id: number, checked: boolean): void {
    this.updateOrderLineTableCheckedSet(id, checked);
    this.refreshOrderLineTableCheckedStatus();

    // refresh the production line structure that associated with the selected order lines
    this.validOrderLines!
      .filter(orderLine => orderLine.id === id)
      .forEach(
        orderLine =>
          this.selectedOrderLineChange(
            checked, orderLine));

  }

  onOrderLineTableAllChecked(value: boolean): void {
    this.validOrderLines!.forEach(item => this.updateOrderLineTableCheckedSet(item.id!, value));
    this.refreshOrderLineTableCheckedStatus();
  }

  orderLineTableCurrentPageDataChange($event: OrderLine[]): void {
    this.validOrderLines! = $event;
    this.refreshOrderLineTableCheckedStatus();
  }

  refreshOrderLineTableCheckedStatus(): void {
    this.orderLineTableChecked = this.validOrderLines!.every(item => this.setOfOrderLineTableCheckedId.has(item.id!));
    this.orderLineTableIndeterminate = this.validOrderLines!.some(item => this.setOfOrderLineTableCheckedId.has(item.id!)) && !this.orderLineTableChecked;
  }


  onStepIndexChange(event: number): void {
    this.stepIndex = event;
  }

  selectedOrderLineChange(checked: boolean, orderLine: OrderLine): void {
    console.log(`order line ${orderLine.orderNumber} \ ${orderLine.item!.name} selected? ${checked}`);
    if (checked) {
      this.billOfMeasureService.findMatchedBillOfMaterialByItemName(orderLine.item!.name).subscribe(billOfMeasureRes => {
        this.mapOfAvailableBillOfMaterial[orderLine.item!.name] = billOfMeasureRes;
        // If we only have one bom defined for the item, let's
        // setup it for the production plan lines that has not setup the BOM yet
        console.log(`find ${billOfMeasureRes.length} for ${orderLine.orderNumber} \ ${orderLine.item!.name} `);
        if (billOfMeasureRes.length === 1) {
          this.setupDefaultBOMForOrderLine(orderLine.id!, billOfMeasureRes[0]);
        }
      });
      this.currentProductionPlan.productionPlanLines.push({
        id: undefined,
        orderLineId: orderLine.id,
        orderLine,
        itemId: orderLine.itemId,
        item: orderLine.item,
        billOfMaterial: undefined,
        inventoryStatusId: orderLine.inventoryStatusId,
        inventoryStatus: orderLine.inventoryStatus,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        warehouse: this.warehouseService.getCurrentWarehouse(),

        expectedQuantity: orderLine.openQuantity,
        inprocessQuantity: 0,
        producedQuantity: 0,
      });
      console.log(`the user now selected totally ${this.currentProductionPlan.productionPlanLines.length} lines`);
      
    } else {
      this.currentProductionPlan.productionPlanLines = this.currentProductionPlan.productionPlanLines.filter(
        productionPlanLine => productionPlanLine.orderLineId !== orderLine.id,
      );
    }
  }
  selectedBOMChange(billOfMaterialNumber: string, productionPlanLine: ProductionPlanLine): void {
    this.mapOfAvailableBillOfMaterial[productionPlanLine.item!.name]
      .filter(billOfMaterail => billOfMaterail.number === billOfMaterialNumber)
      .forEach(billOfMaterial => {
        productionPlanLine.billOfMaterial = billOfMaterial;
      });
  }

  confirmProductionPlanComplete(): void {
    this.isConfirming = true;
    this.productionPlanService.addProductionPlan(this.currentProductionPlan).subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi('message.production-plan.added'));
        setTimeout(() => {
          this.isConfirming = false;
          this.router.navigateByUrl(`/work-order/production-plan?number=${this.currentProductionPlan.number}`);
        }, 500);
      }, 
      error: () => this.isConfirming = false
    });
  }
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
    if (this.stepIndex === 3) {
      // calculate the total expected quantity for the whole production plan
      this.calculateTotalQuantity();
    }
  }
  calculateTotalQuantity(): void {
    this.currentProductionPlan.expectedQuantity = 0;
    this.currentProductionPlan.productionPlanLines.forEach(
      productionPlanLine => (this.currentProductionPlan.expectedQuantity! += +productionPlanLine.expectedQuantity!),
    );
  }

  // setup the bom for the production line when there's only one valid
  // bom for the item
  setupDefaultBOMForOrderLine(orderLineId: number, billOfMaterial: BillOfMaterial): void {
    this.currentProductionPlan.productionPlanLines
      .filter(
        productionPlanLine =>
          productionPlanLine.orderLineId === orderLineId && productionPlanLine.billOfMaterial === null,
      )
      .forEach(productionPlanLine => {
        this.selectedBOM[productionPlanLine.item!.name] = billOfMaterial.number!;
        this.selectedBOMChange(billOfMaterial.number!, productionPlanLine);
      });
  }

  setupDefaultBOMForProductionPlanLine(productionPlanLine: ProductionPlanLine, billOfMaterial: BillOfMaterial): void {
    this.selectedBOM[productionPlanLine.item!.name] = billOfMaterial.number!;
    this.selectedBOMChange(billOfMaterial.number!, productionPlanLine);
  }

  addSelectedOrderLines(): void {
    this.currentProductionPlan.productionPlanLines = [];
    this.validOrderLines.forEach(orderLine => {
      if (this.mapOfCheckedId[orderLine.id!] === true) {
        // If the order line is selected, add it to the
        // production line
        this.currentProductionPlan.productionPlanLines.push({
          id: undefined,
          orderLineId: orderLine.id,
          orderLine,
          itemId: orderLine.itemId,
          item: orderLine.item,
          billOfMaterial: undefined,
          inventoryStatusId: orderLine.inventoryStatusId,
          inventoryStatus: orderLine.inventoryStatus,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          warehouse: this.warehouseService.getCurrentWarehouse(),

          expectedQuantity: orderLine.openQuantity,
          inprocessQuantity: 0,
          producedQuantity: 0,
        });
      }
    });
  }

  previousButtonDisabled(): boolean {
    return false;
  }
  nextButtonDisabled(): boolean {
    switch (this.stepIndex) {
      case 0:
        return !this.isBasicInformationFilled();

      case 1:
        return !this.isOrderLineSelected();
      case 2:
        return !this.isBillOfMaterialFilled();
      default:
        return false;
    }
  }
  isBasicInformationFilled(): boolean {
    return this.currentProductionPlan.number !== null;
  }
  isOrderLineSelected(): boolean {
    if (
      this.currentProductionPlan === undefined ||
      this.currentProductionPlan === null ||
      this.currentProductionPlan.productionPlanLines.length === 0
    ) {
      return false;
    }
    return true;
  }
  isBillOfMaterialFilled(): boolean {
    return true;
  }
  productionPlanNumberOnBlur(event: Event): void {
    this.currentProductionPlan.number = (event.target as HTMLInputElement).value;
  }
  findMatchedOrderLines(): void {
    this.mapOfCheckedId = {};
    this.isSearchingOrder = true;
    this.orderLineService
      .findProductionPlanCandidate(this.filterOrderNumber, this.filterItemName)
      .subscribe({
        next: (orderLinesRes) => {
          this.validOrderLines = orderLinesRes;
          this.isSearchingOrder = false;
        },
        error: () => this.isSearchingOrder = false
      }) 
  }
  clearMatchedOrderLines(): void {
    this.validOrderLines = [];
    this.mapOfCheckedId = {};
    this.currentProductionPlan.productionPlanLines = [];
    this.filterOrderNumber = '';
    this.filterItemName = '';
  }

  canbeSkipped(stepIndex: number): boolean {
    // select order line step can be skipped
    return stepIndex === 1;
  }
  skipToNextStep(): void {
    if (this.stepIndex === 1) {
      // we skip the assignment of order line
      // Let's clear all the order line that already assigned
    }

    this.stepIndex += 1;
  }

  addEmptyProductionLine(): void {
    this.currentProductionPlan.productionPlanLines = [
      ...this.currentProductionPlan.productionPlanLines,
      {
        id: undefined,
        orderLineId: undefined,
        orderLine: undefined,
        itemId: undefined,
        item: undefined,
        billOfMaterial: undefined,
        // default to the first valid inventory status
        inventoryStatusId: this.availableInventoryStatuses.length === 0 ? undefined : this.availableInventoryStatuses[0].id,
        inventoryStatus: this.availableInventoryStatuses.length === 0 ? undefined : this.availableInventoryStatuses[0],
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        warehouse: this.warehouseService.getCurrentWarehouse(),

        expectedQuantity: 0,
        inprocessQuantity: 0,
        producedQuantity: 0,
      },
    ];
  }

  inventoryStatusChange(newInventoryStatusName: string, productionPlanLine: ProductionPlanLine): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        productionPlanLine.inventoryStatus = inventoryStatus;
        productionPlanLine.inventoryStatusId = inventoryStatus.id;
      }
    });
  }
  itemNameSelected(itemId: number, productionPlanLine: ProductionPlanLine): void {
    this.listOfValidBomItem.forEach(bomItem => {
      if (bomItem.id === itemId) {
        productionPlanLine.itemId = bomItem.id;
        productionPlanLine.item = bomItem;
        this.loadValidBOMForItem(bomItem.name, productionPlanLine);
      }
    });
  }
  loadValidBOMForItem(itemName: string, productionPlanLine: ProductionPlanLine): void {
    this.billOfMeasureService.findMatchedBillOfMaterialByItemName(itemName).subscribe(billOfMeasureRes => {
      this.mapOfAvailableBillOfMaterial[itemName] = billOfMeasureRes;
      if (billOfMeasureRes.length === 1) {
        this.setupDefaultBOMForProductionPlanLine(productionPlanLine, billOfMeasureRes[0]);
      }
    });
  }
}
