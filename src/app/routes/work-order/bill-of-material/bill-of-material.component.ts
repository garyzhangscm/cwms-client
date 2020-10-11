import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Customer } from '../../common/models/customer';
import { Order } from '../../outbound/models/order';
import { BillOfMaterial } from '../models/bill-of-material';
import { ProductionLine } from '../models/production-line';
import { WorkOrder } from '../models/work-order';
import { WorkOrderStatus } from '../models/work-order-status.enum';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { ProductionLineService } from '../services/production-line.service';

@Component({
  selector: 'app-work-order-bill-of-material',
  templateUrl: './bill-of-material.component.html',
  styleUrls: ['./bill-of-material.component.less'],
})
export class WorkOrderBillOfMaterialComponent implements OnInit {
  // Form related data and functions
  searchForm!: FormGroup;
  newWorkOrder: WorkOrder = {
    id: undefined,
    number: undefined,
    workOrderLines: [],
    workOrderInstructions: [],
    productionLine: undefined,
    itemId: undefined,
    item: undefined,
    workOrderKPIs: [],
    workOrderByProducts: [],

    warehouseId: undefined,
    warehouse: undefined,
    expectedQuantity: undefined,
    producedQuantity: undefined,
    assignments: [],
    status: WorkOrderStatus.PENDING,
  };
  searching = false;
  searchResult = '';

  availableProductionLines: ProductionLine[] = [];

  newWorkOrderModal!: NzModalRef;

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

  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private titleService: TitleService,
    private modalService: NzModalService,
    private billOfMaterialService: BillOfMaterialService,
    private message: NzMessageService,
    private productionLineService: ProductionLineService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('bill-of-material'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });

    this.productionLineService
      .getProductionLines('')
      .subscribe(productionLineRes => (this.availableProductionLines = productionLineRes));
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllBillOfMaterial = [];
    this.listOfDisplayBillOfMaterial = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.billOfMaterialService
      .getBillOfMaterials(this.searchForm.controls.number.value, this.searchForm.controls.item.value)
      .subscribe(
        billOfMaterailRes => {
          this.listOfAllBillOfMaterial = billOfMaterailRes;
          this.listOfDisplayBillOfMaterial = billOfMaterailRes;
          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: billOfMaterailRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayBillOfMaterial.every(item => this.mapOfCheckedId[item.id!]);
    this.indeterminate =
      this.listOfDisplayBillOfMaterial.some(item => this.mapOfCheckedId[item.id!]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayBillOfMaterial.forEach(item => (this.mapOfCheckedId[item.id!] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data 
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
      if (this.mapOfCheckedId[billOfMaterial.id!] === true) {
        selectedBillOfMaterials.push(billOfMaterial);
      }
    });
    return selectedBillOfMaterials;
  }

  openNewWorkOrderModal(
    billOfMaterial: BillOfMaterial,
    tplCreatingWorkOrderModalTitle: TemplateRef<{}>,
    tplCreatingWorkOrderModalContent: TemplateRef<{}>,
  ): void {
    this.newWorkOrder = {
      id: undefined,
      number: undefined,
      workOrderLines:  [],
      workOrderInstructions:  [],
      productionLine: undefined,
      itemId: undefined,
      item: undefined,
      workOrderKPIs: [],
      workOrderByProducts: [],

      warehouseId: undefined,
      warehouse: undefined,
      expectedQuantity: undefined,
      producedQuantity: undefined,
      assignments:  [],
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
  createWorkOrderFromBOM(billOfMaterial: BillOfMaterial, workOrder: WorkOrder): void {
    this.billOfMaterialService
      .createWorkOrderFromBOM(billOfMaterial, workOrder)
      .subscribe(res => this.message.success(this.i18n.fanyi('message.action.success')));
  }

  productLineChanged(newProductionLineId: number): void {
    const productionLines = this.availableProductionLines.filter(
      productionLine => productionLine.id === newProductionLineId,
    );
    if (productionLines.length === 1) {
      this.newWorkOrder.productionLine = productionLines[0];
    }
  }

  workOrderNumberOnBlur(workOrderNumber: string): void {
    this.newWorkOrder.number = workOrderNumber;
  }

  modifyBillOfMaterial(billOfMaterial: BillOfMaterial): void {
    this.router.navigateByUrl(`/work-order/bill-of-material/maintenance?id=${billOfMaterial.id}`);
  }
}
