import { Inject , ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { interval, Subscription } from 'rxjs';

import { ProductionLineKanbanData } from '../../work-order/models/production-line-kanban-data';
import { ProductionLineKanbanService } from '../../work-order/services/production-line-kanban.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineService } from '../services/production-line.service';


@Component({
  selector: 'app-dashboard-production-kanban',
  templateUrl: './production-kanban.component.html',
  styleUrls: ['./production-kanban.component.less'],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderProductionKanbanComponent implements OnInit {
  productionLineKanbanDataList: ProductionLineKanbanData[] = [];
  displayProductionLineKanbanDataList: ProductionLineKanbanData[] = [];
  productionLines: ProductionLine[] = [];

  showProductionLineSet = new Set<string>();
  hideProductionLineSelection = true;

  /***
   * 
    listOfColumns: ColumnItem[] = [
      {
        name: 'production-line.name',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableString(a.productionLineName, b.productionLineName),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'work-order.number',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableString(a.workOrderNumber, b.workOrderNumber),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'item.name',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableString(a.itemName, b.itemName),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'production-line.model',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableString(a.productionLineModel!, b.productionLineModel!),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'production-line.target-production',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableNumber(a.productionLineTargetOutput, b.productionLineTargetOutput),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'production-line.actual-production',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableNumber(a.productionLineActualOutput, b.productionLineActualOutput),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'production-line.actual-putaway-production',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableNumber(a.productionLineActualPutawayOutput, b.productionLineActualPutawayOutput),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'production-line.target-total-production',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableNumber(a.productionLineTotalTargetOutput, b.productionLineTotalTargetOutput),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'production-line.actual-total-production',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableNumber(a.productionLineTotalActualOutput, b.productionLineTotalActualOutput),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'production-line.actual-total-putaway-production',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableNumber(a.productionLineTotalActualPutawayOutput, b.productionLineTotalActualPutawayOutput),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'status',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableString(a.workOrderStatus!, b.workOrderStatus!),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'shift',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableString(a.shift!, b.shift!),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },
      {
        name: 'finished-rate',
        showSort: true,
        sortOrder: null,
        sortFn: (a: ProductionLineKanbanData, b: ProductionLineKanbanData) => this.utilService.compareNullableNumber(a.percent!, b.percent!),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false,
      },];
   */

  //  @ViewChild('cd', { static: false }) private countdown!: CountdownComponent; 
  // @ViewChild('countdown', { static: true }) private countdown!: CountdownComponent; 
  // endregion

  countDownNumber = 60;
  countDownsubscription!: Subscription;
  constructor(
    public msg: NzMessageService, private cdr: ChangeDetectorRef,
    private productionLineKanbanService: ProductionLineKanbanService,
    private productionLineService: ProductionLineService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.loadProductionLines();
  }

  ngOnInit(): void {
    this.resetCountDownNumber();
    this.loadKanbanData();
    this.countDownsubscription = interval(1000).subscribe(x => {
      this.handleCountDownEvent();
    })

  }
  ngOnDestroy() {
    this.countDownsubscription.unsubscribe();

  }
  loadProductionLines() {
    this.productionLineService.getProductionLines()
      .subscribe(productionLinesRes => {
        this.productionLines = productionLinesRes;
        // by default, we will show all production lines
        this.productionLines.forEach(productionLine => {
          this.showProductionLineSet.add(productionLine.name)
        });
        this.refreshKanbanData();

      });
  }
  refreshKanbanData() {

    this.displayProductionLineKanbanDataList = this.productionLineKanbanDataList.filter(
      item => this.showProductionLineSet.has(item.productionLineName)
    );
  }
  // switch to add or remove the productione line from display
  switchProductionLineDisplay(name: string) {
    if (this.showProductionLineSet.has(name)) {
      this.showProductionLineSet.delete(name);
    }
    else {
      this.showProductionLineSet.add(name);
    }
    this.refreshKanbanData();
  }
  handleCountDownEvent(): void {
    this.countDownNumber--;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();
      this.loadKanbanData();
    }
  }
  resetCountDownNumber() {
    this.countDownNumber = 60;
  }
  loadKanbanData() {


    this.productionLineKanbanService.getProductionLineKanbanData()
      .subscribe(productionLineKanbanDataRes => {
        this.productionLineKanbanDataList = productionLineKanbanDataRes;
        this.productionLineKanbanDataList.forEach(
          productionLineKanbanData =>
            productionLineKanbanData.percent = (
              productionLineKanbanData.productionLineActualOutput * 100 / productionLineKanbanData.productionLineTargetOutput
            )
        )
        this.refreshKanbanData();
      });
  }

  toggleProductionLineDisplay() {
    this.hideProductionLineSelection = !this.hideProductionLineSelection;
  }

  columns: STColumn[] = [
    { title: this.i18n.fanyi("production-line.name"), index: 'productionLineName', iif: () => this.isChoose('productionLineName'), },
    { title: this.i18n.fanyi("work-order.number"), index: 'workOrderNumber', iif: () => this.isChoose('workOrderNumber'), },
    { title: this.i18n.fanyi("item.name"), index: 'itemName', iif: () => this.isChoose('itemName'), },
    { title: this.i18n.fanyi("production-line.target-production"), index: 'productionLineTargetOutput', iif: () => this.isChoose('productionLineTargetOutput'), },
    { title: this.i18n.fanyi("production-line.actual-production"), index: 'productionLineActualOutput', iif: () => this.isChoose('productionLineActualOutput'), },
    { title: this.i18n.fanyi("production-line.actual-putaway-production"), index: 'productionLineActualPutawayOutput', iif: () => this.isChoose('productionLineActualPutawayOutput'), },
    { title: this.i18n.fanyi("production-line.target-total-production"), index: 'productionLineTotalTargetOutput', iif: () => this.isChoose('productionLineTotalTargetOutput'), },
    { title: this.i18n.fanyi("production-line.actual-total-production"), index: 'productionLineTotalActualOutput', iif: () => this.isChoose('productionLineTotalActualOutput'), },
    { title: this.i18n.fanyi("production-line.actual-total-putaway-production"), index: 'productionLineTotalActualPutawayOutput', iif: () => this.isChoose('productionLineTotalActualPutawayOutput'), },
    { title: this.i18n.fanyi("status"), index: 'workOrderStatus', iif: () => this.isChoose('workOrderStatus'), },
    { title: this.i18n.fanyi("shift"), index: 'shift', iif: () => this.isChoose('shift'), },
    { title: this.i18n.fanyi("finished-rate"), index: 'percent', iif: () => this.isChoose('percent'), type: 'number' },
  ];
  customColumns = [

    { label: this.i18n.fanyi("production-line.name"), value: 'productionLineName', checked: true },
    { label: this.i18n.fanyi("work-order.number"), value: 'workOrderNumber', checked: true },
    { label: this.i18n.fanyi("item.name"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("production-line.target-production"), value: 'productionLineTargetOutput', checked: true },
    { label: this.i18n.fanyi("production-line.actual-production"), value: 'productionLineActualOutput', checked: true },
    { label: this.i18n.fanyi("production-line.actual-putaway-production"), value: 'productionLineActualPutawayOutput', checked: true },
    { label: this.i18n.fanyi("production-line.target-total-production"), value: 'productionLineTotalTargetOutput', checked: true },
    { label: this.i18n.fanyi("production-line.actual-total-production"), value: 'productionLineTotalActualOutput', checked: true },
    { label: this.i18n.fanyi("production-line.actual-total-putaway-production"), value: 'productionLineTotalActualPutawayOutput', checked: true },
    { label: this.i18n.fanyi("status"), value: 'workOrderStatus', checked: true },
    { label: this.i18n.fanyi("shift"), value: 'shift', checked: true },
    { label: this.i18n.fanyi("finished-rate"), value: 'percent', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }
}
