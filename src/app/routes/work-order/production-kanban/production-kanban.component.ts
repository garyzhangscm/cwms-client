import { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STData } from '@delon/abc/st';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { interval, Subscription } from 'rxjs';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { ProductionLineKanbanData } from '../../work-order/models/production-line-kanban-data';
import { ProductionLineKanbanService } from '../../work-order/services/production-line-kanban.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineService } from '../services/production-line.service';
import { STModule } from '@delon/abc/st';
import { NzModalService } from 'ng-zorro-antd/modal';



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

  //  @ViewChild('cd', { static: false }) private countdown!: CountdownComponent; 
  // @ViewChild('countdown', { static: true }) private countdown!: CountdownComponent; 
  // endregion

  countDownNumber = 60;
  countDownsubscription!: Subscription;
  constructor(private http: _HttpClient, public msg: NzMessageService, private cdr: ChangeDetectorRef,

    private utilService: UtilService,
    private productionLineKanbanService: ProductionLineKanbanService,
    private productionLineService: ProductionLineService) {
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
      console.log(`remove production line ${name}`);
      this.showProductionLineSet.delete(name);
    }
    else {
      console.log(`add production line ${name}`);
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

  users: STData[] = Array(10)
    .fill({})
    .map((_, idx) => {
      return {
        id: idx + 1,
        name: `name ${idx + 1}`,
        age: Math.ceil(Math.random() * 10) + 20,
      };
    });
  columns: STColumn[] = [
    { title: '编号', index: 'id' },
    { title: '姓名', index: 'name', iif: () => this.isChoose('name') },
    { title: '年龄', index: 'age', iif: () => this.isChoose('age') },
    {
      title: '自定义',
      renderTitle: 'customTitle',
      render: 'custom',
      iif: () => this.isChoose('custom'),
    },
  ];
  customColumns = [
    { label: '姓名', value: 'name', checked: true },
    { label: '年龄', value: 'age', checked: true },
    { label: '自定义', value: 'custom', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }
}
