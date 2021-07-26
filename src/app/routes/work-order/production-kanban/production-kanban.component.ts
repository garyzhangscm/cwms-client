import { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown'; 
import { interval } from 'rxjs';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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
  productionLines: ProductionLine[] = [];


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
    }, ];
 
   //  @ViewChild('cd', { static: false }) private countdown!: CountdownComponent; 
   // @ViewChild('countdown', { static: true }) private countdown!: CountdownComponent; 
  // endregion

  countDownNumber = 60;
  constructor(private http: _HttpClient, public msg: NzMessageService, private cdr: ChangeDetectorRef,

    private utilService: UtilService,
    private productionLineKanbanService: ProductionLineKanbanService,
    private productionLineService: ProductionLineService) { 
   }

  ngOnInit(): void {
    /**
    this.productionLineKanbanDataList = [
      {"productionLineName":"M1-JW-750T","workOrderNumber":"2021050024-01",
      "productionLineModel":null,"productionLineTargetOutput":0,"productionLineActualOutput":0,"productionLineTotalTargetOutput":20961,
      "productionLineTotalActualOutput":0,"workOrderStatus":null,"shift":null},
      {"productionLineName":"M2-Borche-700T","workOrderNumber":"2021010072-01","productionLineModel":null,
      "productionLineTargetOutput":0,"productionLineActualOutput":0,"productionLineTotalTargetOutput":30000,
      "productionLineTotalActualOutput":0,"workOrderStatus":null,"shift":null}]
       */ 
      this.resetCountDownNumber();
      this.loadKanbanData();
      interval(1000).subscribe(x => {
        this.handleCountDownEvent();
      })

  } 
  handleCountDownEvent(): void {
    console.log(`countdown: ${this.countDownNumber}`)
    this.countDownNumber --;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();
      this.loadKanbanData();
    }
  }
  resetCountDownNumber() {
    this.countDownNumber= 60;
  }
  loadKanbanData() {


    this.productionLineKanbanService.getProductionLineKanbanData()
        .subscribe(productionLineKanbanDataRes => {

          console.log(`get kanban data: \n${JSON.stringify(productionLineKanbanDataRes)}`);
          console.log(`size:${productionLineKanbanDataRes.length}`)
          this.productionLineKanbanDataList = productionLineKanbanDataRes;
  });
}
}
