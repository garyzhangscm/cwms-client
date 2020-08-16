import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { I18NService } from '@core';
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Order } from '../../outbound/models/order';
import { Customer } from '../../common/models/customer';
import { BillOfMaterial } from '../models/bill-of-material';
import { WorkOrder } from '../models/work-order';
import { ProductionLine } from '../models/production-line';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderStatus } from '../models/work-order-status.enum';

@Component({
  selector: 'app-work-order-bill-of-material',
  templateUrl: './bill-of-material.component.html',
  styleUrls: ['./bill-of-material.component.less'],
})
export class WorkOrderBillOfMaterialComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private billOfMaterialService: BillOfMaterialService,
    private message: NzMessageService,
    private productionLineService: ProductionLineService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;
  newWorkOrder: WorkOrder = {
    id: null,
    number: null,
    workOrderLines: null,
    workOrderInstructions: null,
    productionLine: null,
    itemId: null,
    item: null,
    workOrderKPIs: [],
    workOrderByProducts: [],

    warehouseId: null,
    warehouse: null,
    expectedQuantity: null,
    producedQuantity: null,
    assignments: null,
    status: WorkOrderStatus.PENDING,
  };
  searching = false;

  availableProductionLines: ProductionLine[] = [];

  newWorkOrderModal: NzModalRef;

  // Table data for display
  listOfAllBillOfMaterial: BillOfMaterial[] = [];
  listOfDisplayBillOfMaterial: BillOfMaterial[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllBillOfMaterial = [];
    this.listOfDisplayBillOfMaterial = [];
  }

  search(): void {
    this.searching = true;
    this.billOfMaterialService
      .getBillOfMaterials(this.searchForm.controls.number.value, this.searchForm.controls.item.value)
      .subscribe(billOfMaterailRes => {
        this.listOfAllBillOfMaterial = billOfMaterailRes;
        this.listOfDisplayBillOfMaterial = billOfMaterailRes;
        this.searching = false;
      });
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayBillOfMaterial.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayBillOfMaterial.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayBillOfMaterial.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayBillOfMaterial = this.listOfAllBillOfMaterial.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayBillOfMaterial = this.listOfAllBillOfMaterial;
    }
  }

  removeSelectedBillOfMaterials(): void {
    // make sure we have at least one checkbox checked
    const selectedBillOfMaterials = this.getSelectedBillOfMaterials();
    if (selectedBillOfMaterials.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.billOfMaterialService.removeBillOfMaterials(selectedBillOfMaterials).subscribe(res => {
            this.message.success(this.i18n.fanyi('message.action.success'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedBillOfMaterials(): BillOfMaterial[] {
    const selectedBillOfMaterials: BillOfMaterial[] = [];
    this.listOfAllBillOfMaterial.forEach((billOfMaterial: BillOfMaterial) => {
      if (this.mapOfCheckedId[billOfMaterial.id] === true) {
        selectedBillOfMaterials.push(billOfMaterial);
      }
    });
    return selectedBillOfMaterials;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });
    this.productionLineService
      .getProductionLines('')
      .subscribe(productionLineRes => (this.availableProductionLines = productionLineRes));
  }

  openNewWorkOrderModal(
    billOfMaterial: BillOfMaterial,
    tplCreatingWorkOrderModalTitle: TemplateRef<{}>,
    tplCreatingWorkOrderModalContent: TemplateRef<{}>,
  ) {
    this.newWorkOrder = {
      id: null,
      number: null,
      workOrderLines: null,
      workOrderInstructions: null,
      productionLine: null,
      itemId: null,
      item: null,
      workOrderKPIs: [],
      workOrderByProducts: [],

      warehouseId: null,
      warehouse: null,
      expectedQuantity: null,
      producedQuantity: null,
      assignments: null,
      status: WorkOrderStatus.PENDING,
    };
    // show the model
    this.newWorkOrderModal = this.modalService.create({
      nzTitle: tplCreatingWorkOrderModalTitle,
      nzContent: tplCreatingWorkOrderModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.newWorkOrderModal.destroy();
        this.search();
      },
      nzOnOk: () => {
        this.createWorkOrderFromBOM(billOfMaterial, this.newWorkOrder);
      },
      nzWidth: 1000,
    });
  }
  createWorkOrderFromBOM(billOfMaterial: BillOfMaterial, workOrder: WorkOrder) {
    this.billOfMaterialService
      .createWorkOrderFromBOM(billOfMaterial, workOrder)
      .subscribe(res => this.message.success(this.i18n.fanyi('message.action.success')));
  }

  productLineChanged(newProductionLineId) {
    const productionLines = this.availableProductionLines.filter(
      productionLine => productionLine.id === newProductionLineId,
    );
    if (productionLines.length === 1) {
      this.newWorkOrder.productionLine = productionLines[0];
    }
  }

  workOrderNumberOnBlur(workOrderNumber: string) {
    this.newWorkOrder.number = workOrderNumber;
  }
}
