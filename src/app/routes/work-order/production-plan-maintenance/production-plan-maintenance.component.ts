import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ProductionPlan } from '../models/production-plan';
import { I18NService } from '@core';
import { ProductionPlanService } from '../services/production-plan.service';
import { OrderLine } from '../../outbound/models/order-line';
import { BillOfMaterial } from '../models/bill-of-material';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { OrderService } from '../../outbound/services/order.service';
import { OrderLineService } from '../../outbound/services/order-line.service';
import { ItemService } from '../../inventory/services/item.service';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Item } from '../../inventory/models/item';
import { ProductionPlanLine } from '../models/production-plan-line';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';

@Component({
  selector: 'app-work-order-production-plan-maintenance',
  templateUrl: './production-plan-maintenance.component.html',
  styleUrls: ['./production-plan-maintenance.component.less'],
})
export class WorkOrderProductionPlanMaintenanceComponent implements OnInit {
  pageTitle: string;
  stepIndex: number;
  currentProductionPlan: ProductionPlan;
  allOrderLinesChecked = false;
  allOrderLinesCheckedIndeterminate = false;

  mapOfExpandedId: { [key: string]: boolean } = {};
  mapOfExpandedBOMId: { [key: string]: boolean } = {};
  mapOfCheckedId: { [key: string]: boolean } = {};
  filterOrderNumber: string;
  filterItemName: string;
  validOrderLines: OrderLine[] = [];
  mapOfAvailableBillOfMaterial: { [key: string]: BillOfMaterial[] } = {};
  listOfValidBomItem: Item[];
  availableInventoryStatuses: InventoryStatus[] = [];

  selectedBOM: { [key: string]: string } = {};

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private productionPlanService: ProductionPlanService,
    private messageService: NzMessageService,
    private router: Router,
    private orderLineService: OrderLineService,
    private warehouseService: WarehouseService,
    private billOfMeasureService: BillOfMaterialService,
    private inventoryStatusService: InventoryStatusService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.production-plan.new');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.production-plan.new'));

    this.currentProductionPlan = {
      id: null,
      number: null,
      description: null,
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
  initListOfValidBomItems() {
    this.listOfValidBomItem = [];
    this.billOfMeasureService.getBillOfMaterials().subscribe(bomRes => {
      bomRes.forEach(bom => {
        this.listOfValidBomItem.push(bom.item);
      });
    });
  }

  onAllOrderLineChecked(checked: boolean): void {
    this.validOrderLines.forEach(orderLine => {
      const originalStatus = this.mapOfCheckedId[orderLine.id];
      this.mapOfCheckedId[orderLine.id] = checked;
      if (originalStatus !== checked) {
        // checked status is changed. let's
        // call the function selectedOrderLineChange which will
        // load the valid for the selected order lines
        // or remove the BOM for those unselected order lines
        this.selectedOrderLineChange(checked, orderLine);
      }
    });
    this.orderLineTableRefreshStatus();
  }

  orderLineTableRefreshStatus(): void {
    this.allOrderLinesChecked = this.validOrderLines.every(item => this.mapOfCheckedId[item.id]);
    this.allOrderLinesCheckedIndeterminate =
      this.validOrderLines.some(item => this.mapOfCheckedId[item.id]) && !this.allOrderLinesChecked;
  }
  onStepIndexChange(event: number): void {
    this.stepIndex = event;
  }

  selectedOrderLineChange(checked: boolean, orderLine: OrderLine) {
    console.log(`order line ${orderLine.orderNumber} \ ${orderLine.item.name} selected? ${checked}`);
    if (checked) {
      this.billOfMeasureService.findMatchedBillOfMaterialByItemName(orderLine.item.name).subscribe(billOfMeasureRes => {
        this.mapOfAvailableBillOfMaterial[orderLine.item.name] = billOfMeasureRes;
        // If we only have one bom defined for the item, let's
        // setup it for the production plan lines that has not setup the BOM yet
        if (billOfMeasureRes.length === 1) {
          this.setupDefaultBOMForOrderLine(orderLine.id, billOfMeasureRes[0]);
        }
      });
      this.currentProductionPlan.productionPlanLines.push({
        id: null,
        orderLineId: orderLine.id,
        orderLine,
        itemId: orderLine.itemId,
        item: orderLine.item,
        billOfMaterial: null,
        inventoryStatusId: orderLine.inventoryStatusId,
        inventoryStatus: orderLine.inventoryStatus,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        warehouse: this.warehouseService.getCurrentWarehouse(),

        expectedQuantity: orderLine.openQuantity,
        inprocessQuantity: 0,
        producedQuantity: 0,
      });
    } else {
      this.currentProductionPlan.productionPlanLines = this.currentProductionPlan.productionPlanLines.filter(
        productionPlanLine => productionPlanLine.orderLineId !== orderLine.id,
      );
    }
  }
  selectedBOMChange(billOfMaterialNumber: string, productionPlanLine: ProductionPlanLine) {
    this.mapOfAvailableBillOfMaterial[productionPlanLine.item.name]
      .filter(billOfMaterail => billOfMaterail.number === billOfMaterialNumber)
      .forEach(billOfMaterial => {
        productionPlanLine.billOfMaterial = billOfMaterial;
      });
  }

  confirmProductionPlanComplete() {
    this.productionPlanService.addProductionPlan(this.currentProductionPlan).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.production-plan.added'));
      setTimeout(() => {
        this.router.navigateByUrl(`/work-order/production-plan?number=${this.currentProductionPlan.number}`);
      }, 2500);
    });
  }
  previousStep() {
    this.stepIndex -= 1;
  }
  nextStep() {
    this.stepIndex += 1;
    if (this.stepIndex === 3) {
      // calculate the total expected quantity for the whole production plan
      this.calculateTotalQuantity();
    }
  }
  calculateTotalQuantity() {
    this.currentProductionPlan.expectedQuantity = 0;
    this.currentProductionPlan.productionPlanLines.forEach(
      productionPlanLine => (this.currentProductionPlan.expectedQuantity += +productionPlanLine.expectedQuantity),
    );
  }

  // setup the bom for the production line when there's only one valid
  // bom for the item
  setupDefaultBOMForOrderLine(orderLineId: number, billOfMaterial: BillOfMaterial) {
    this.currentProductionPlan.productionPlanLines
      .filter(
        productionPlanLine =>
          productionPlanLine.orderLineId === orderLineId && productionPlanLine.billOfMaterial === null,
      )
      .forEach(productionPlanLine => {
        this.selectedBOM[productionPlanLine.item.name] = billOfMaterial.number;
        this.selectedBOMChange(billOfMaterial.number, productionPlanLine);
      });
  }

  setupDefaultBOMForProductionPlanLine(productionPlanLine: ProductionPlanLine, billOfMaterial: BillOfMaterial) {
    this.selectedBOM[productionPlanLine.item.name] = billOfMaterial.number;
    this.selectedBOMChange(billOfMaterial.number, productionPlanLine);
  }

  addSelectedOrderLines() {
    this.currentProductionPlan.productionPlanLines = [];
    this.validOrderLines.forEach(orderLine => {
      if (this.mapOfCheckedId[orderLine.id] === true) {
        // If the order line is selected, add it to the
        // production line
        this.currentProductionPlan.productionPlanLines.push({
          id: null,
          orderLineId: orderLine.id,
          orderLine,
          itemId: orderLine.itemId,
          item: orderLine.item,
          billOfMaterial: null,
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
  productionPlanNumberOnBlur(productionPlanNumber: string) {
    this.currentProductionPlan.number = productionPlanNumber;
  }
  findMatchedOrderLines() {
    this.mapOfCheckedId = {};
    this.orderLineService
      .findProductionPlanCandidate(this.filterOrderNumber, this.filterItemName)
      .subscribe(orderLinesRes => {
        this.validOrderLines = orderLinesRes;
      });
  }
  clearMatchedOrderLines() {
    this.validOrderLines = [];
    this.mapOfCheckedId = {};
    this.currentProductionPlan.productionPlanLines = [];
  }

  canbeSkipped(stepIndex: number) {
    // select order line step can be skipped
    return stepIndex === 1;
  }
  skipToNextStep() {
    if (this.stepIndex === 1) {
      // we skip the assignment of order line
      // Let's clear all the order line that already assigned
    }

    this.stepIndex += 1;
  }

  addEmptyProductionLine() {
    this.currentProductionPlan.productionPlanLines = [
      ...this.currentProductionPlan.productionPlanLines,
      {
        id: null,
        orderLineId: null,
        orderLine: null,
        itemId: null,
        item: null,
        billOfMaterial: null,
        // default to the first valid inventory status
        inventoryStatusId: this.availableInventoryStatuses.length === 0 ? null : this.availableInventoryStatuses[0].id,
        inventoryStatus: this.availableInventoryStatuses.length === 0 ? null : this.availableInventoryStatuses[0],
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        warehouse: this.warehouseService.getCurrentWarehouse(),

        expectedQuantity: 0,
        inprocessQuantity: 0,
        producedQuantity: 0,
      },
    ];
  }

  inventoryStatusChange(newInventoryStatusName: string, productionPlanLine: ProductionPlanLine) {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        productionPlanLine.inventoryStatus = inventoryStatus;
        productionPlanLine.inventoryStatusId = inventoryStatus.id;
      }
    });
  }
  itemNameSelected(itemId: number, productionPlanLine: ProductionPlanLine) {
    this.listOfValidBomItem.forEach(bomItem => {
      if (bomItem.id === itemId) {
        productionPlanLine.itemId = bomItem.id;
        productionPlanLine.item = bomItem;
        this.loadValidBOMForItem(bomItem.name, productionPlanLine);
      }
    });
  }
  loadValidBOMForItem(itemName: string, productionPlanLine: ProductionPlanLine) {
    this.billOfMeasureService.findMatchedBillOfMaterialByItemName(itemName).subscribe(billOfMeasureRes => {
      this.mapOfAvailableBillOfMaterial[itemName] = billOfMeasureRes;
      if (billOfMeasureRes.length === 1) {
        this.setupDefaultBOMForProductionPlanLine(productionPlanLine, billOfMeasureRes[0]);
      }
    });
  }
}
