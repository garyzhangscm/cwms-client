import { formatDate } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { WorkOrder } from '../../work-order/models/work-order';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { UtilService } from '../services/util.service';

@Component({
    selector: 'app-util-work-order-query-popup',
    templateUrl: './work-order-query-popup.component.html',
    styleUrls: ['./work-order-query-popup.component.less'],
    standalone: false
})
export class UtilWorkOrderQueryPopupComponent implements OnInit {
  scrollX = '100vw';
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  
  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: 'id', index: 'work-order.id', type: 'radio' },
    { title: this.i18n.fanyi("work-order.number"), index: 'number',  iif: () => this.isChoose('number'), width: 150 },    
    { title: this.i18n.fanyi("status"), index: 'status',  iif: () => this.isChoose('status'), width: 150 },    
    { title: this.i18n.fanyi("item"), index: 'item.name',  iif: () => this.isChoose('itemName'), width: 150 },    
    { title: this.i18n.fanyi("item.description"), index: 'item.description',  iif: () => this.isChoose('itemDescription'), width: 150 },    
    { title: this.i18n.fanyi("work-order.expected-quantity"), index: 'expectedQuantity',  iif: () => this.isChoose('expectedQuantity'), width: 150 },    
    { title: this.i18n.fanyi("work-order.produced-quantity"), index: 'producedQuantity',  iif: () => this.isChoose('producedQuantity'), width: 150 },    
    { title: this.i18n.fanyi("qcQuantity"), index: 'qcQuantity',  iif: () => this.isChoose('qcQuantity'), width: 150 },        
    { title: this.i18n.fanyi("qcPercentage"), index: 'qcPercentage',  iif: () => this.isChoose('qcPercentage'), width: 150 },  
    { title: this.i18n.fanyi("qcQuantityRequested"), index: 'qcQuantityRequested',  iif: () => this.isChoose('qcQuantityRequested'), width: 150 },  
    { title: this.i18n.fanyi("qcQuantityCompleted"), index: 'qcQuantityCompleted',  iif: () => this.isChoose('qcQuantityCompleted'), width: 150 },     
  ];
  customColumns = [

    { label: this.i18n.fanyi("work-order.number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true },
    { label: this.i18n.fanyi("work-order.expected-quantity"), value: 'expectedQuantity', checked: true },
    { label: this.i18n.fanyi("work-order.produced-quantity"), value: 'producedQuantity', checked: true },
    { label: this.i18n.fanyi("qcQuantity"), value: 'qcQuantity', checked: true },
    { label: this.i18n.fanyi("qcPercentage"), value: 'qcPercentage', checked: true },
    { label: this.i18n.fanyi("qcQuantityRequested"), value: 'qcQuantityRequested', checked: true },
    { label: this.i18n.fanyi("qcQuantityCompleted"), value: 'qcQuantityCompleted', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  // Form related data and functions
  queryModal!: NzModalRef;
  searchForm!: UntypedFormGroup;

  searching = false;
  queryInProcess = false;
  searchResult = '';


  // Table data for display
  listOfAllWorkOrders: WorkOrder[] = []; 

  // list of checked checkbox
  setOfCheckedId = new Set<number>();

  // eslint-disable-next-line @angular-eslint/prefer-output-readonly
  @Output() recordSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder,
    private workOrderService: WorkOrderService,
    private modalService: NzModalService,
    private utilService: UtilService,
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {

  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllWorkOrders = []; 
  }

  search(): void {
    this.searching = true;
    this.workOrderService
      .getWorkOrders(
        this.searchForm.value.number, 
        this.searchForm.value.item
      )
      .subscribe(
        workOrderRes => {
          this.listOfAllWorkOrders = workOrderRes; 
          this.setOfCheckedId.clear();

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: workOrderRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }
 

  isAnyRecordChecked(): boolean {
    
    if (this.st == null || this.st.list == null) {
      return false;
    }
    const dataList: STData[] = this.st.list;
    return dataList.some(record =>  record.checked );
  }

  openQueryModal(
    tplQueryModalTitle: TemplateRef<{}>,
    tplQueryModalContent: TemplateRef<{}>,
    tplQueryModalFooter: TemplateRef<{}>,
  ): void {

    this.listOfAllWorkOrders = []; 
    this.createQueryForm();

    // show the model
    this.queryModal = this.modalService.create({
      nzTitle: tplQueryModalTitle,
      nzContent: tplQueryModalContent,
      nzFooter: tplQueryModalFooter,

      nzWidth: 1000,
    });
  }
  createQueryForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });

    
  }
  closeQueryModal(): void {
    this.queryModal.destroy();
  }
  returnResult(): void {
    // get the selected record
    if (this.isAnyRecordChecked()) {
      this.recordSelected.emit(
        this.getSelectedWorkOrder()[0].number,
      );
    } else {
      this.recordSelected.emit('');
    }
    this.queryModal.destroy();

  }
  
  getSelectedWorkOrder(): WorkOrder[] {
    
    const dataList: STData[] = this.st.list;
    let selectedWorkOrder: WorkOrder[] = [];
    dataList.filter(record => record.checked === true)
    .forEach(record => {
      selectedWorkOrder = [...selectedWorkOrder, 
          ...this.listOfAllWorkOrders.filter(workOrder => workOrder.number === record["number"])];
    });
    return selectedWorkOrder;

  }

}
