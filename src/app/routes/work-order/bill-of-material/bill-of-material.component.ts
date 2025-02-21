import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Customer } from '../../common/models/customer';
import { Order } from '../../outbound/models/order';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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
    standalone: false
})
export class WorkOrderBillOfMaterialComponent implements OnInit {

  listOfColumns: Array<ColumnItem<BillOfMaterial>> = [
    {
      name: 'bill-of-material.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: BillOfMaterial, b: BillOfMaterial) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: BillOfMaterial, b: BillOfMaterial) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: BillOfMaterial, b: BillOfMaterial) => this.utilService.compareNullableObjField(a.item, b.item, 'description'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },{
      name: 'bill-of-material.expectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: BillOfMaterial, b: BillOfMaterial) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];
  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  expandSet = new Set<number>();
  isSpinning = false;

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  newWorkOrder: WorkOrder = {
    id: undefined,
    number: undefined,
    workOrderLines: [],
    workOrderInstructions: [],
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
  newWorkOrderProductionLine: ProductionLine | undefined;

  // Table data for display
  listOfAllBillOfMaterial: BillOfMaterial[] = [];
  listOfDisplayBillOfMaterial: BillOfMaterial[] = [];


  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private modalService: NzModalService,
    private billOfMaterialService: BillOfMaterialService,
    private message: NzMessageService,
    private productionLineService: ProductionLineService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilService: UtilService,
    private userService: UserService,
  ) {
    userService.isCurrentPageDisplayOnly("/work-order/bill-of-material").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                                 
   }
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('bill-of-material'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number']) {
        this.searchForm.value.number.setValue(params['number']);
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
    this.isSpinning = true;
    this.searchResult = '';
    this.billOfMaterialService
      .getBillOfMaterials(this.searchForm.value.number.value, this.searchForm.value.item.value)
      .subscribe(
        billOfMaterailRes => {
          this.listOfAllBillOfMaterial = billOfMaterailRes;
          this.listOfDisplayBillOfMaterial = billOfMaterailRes;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: billOfMaterailRes.length,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayBillOfMaterial!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: BillOfMaterial[]): void {
    this.listOfDisplayBillOfMaterial! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayBillOfMaterial!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayBillOfMaterial!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
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
        nzOkDanger: true,
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
      if (this.setOfCheckedId.has(billOfMaterial.id!)) {
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
      workOrderLines: [],
      workOrderInstructions: [],
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
    // show the model
    this.newWorkOrderProductionLine = undefined
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
    this.isSpinning = true;
    this.billOfMaterialService
      .createWorkOrderFromBOM(billOfMaterial, workOrder, this.newWorkOrderProductionLine)
      .subscribe(res => {
        this.message.success(this.i18n.fanyi('message.action.success'))
      
        this.isSpinning = false;
      });
  } 

  workOrderNumberOnBlur(event: Event): void {
    this.newWorkOrder.number = (event.target as HTMLInputElement).value;
  }

  modifyBillOfMaterial(billOfMaterial: BillOfMaterial): void {
    this.router.navigateByUrl(`/work-order/bill-of-material/maintenance?id=${billOfMaterial.id}`);
  }
}
