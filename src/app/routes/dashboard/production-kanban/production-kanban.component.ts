import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { zip } from 'rxjs';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { WorkOrder } from '../../work-order/models/work-order';


interface ProductionLineKanbanInformation {
  productionLineName: string;
  workOrderNumber: string;
  productionLineModal: string;
  targetProduction: number;
  actualProduction: number;
  targetTotalProduction: number;
  actualTotalProduction: number;
  productionStatus: string;
  shift: string;
  yieldRate: number;
}

@Component({
  selector: 'app-dashboard-production-kanban',
  templateUrl: './production-kanban.component.html',
  styleUrls: ['./production-kanban.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardProductionKanbanComponent implements OnInit {
  productionLineKanbanInformationList: ProductionLineKanbanInformation[] = [];


  listOfColumns: ColumnItem[] = [
    {
      name: 'production-line.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableString(a.productionLineName, b.productionLineName),
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
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableString(a.workOrderNumber, b.workOrderNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
    },
    {
      name: 'production-line.modal',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableString(a.productionLineModal, b.productionLineModal),
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
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableNumber(a.targetProduction, b.targetProduction),
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
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableNumber(a.actualProduction, b.actualProduction),
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
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableNumber(a.targetTotalProduction, b.targetTotalProduction),
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
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableNumber(a.actualTotalProduction, b.actualTotalProduction),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
    },
    {
      name: 'production-line.production-status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableString(a.productionStatus, b.productionStatus),
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
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableString(a.shift, b.shift),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
    },
    {
      name: 'production-line.yield-rate',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLineKanbanInformation, b: ProductionLineKanbanInformation) => this.utilService.compareNullableNumber(a.yieldRate, b.yieldRate),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
    },];

  // endregion

  constructor(private http: _HttpClient, public msg: NzMessageService, private cdr: ChangeDetectorRef,

    private utilService: UtilService,) { }

  ngOnInit(): void {

    this.productionLineKanbanInformationList.push(
      {
        productionLineName: "M1-JW-750T",
        workOrderNumber: "WO1",
        productionLineModal: "JW-750T",
        targetProduction: 5000,
        actualProduction: 1000,
        targetTotalProduction: 500000,
        actualTotalProduction: 50000,
        productionStatus: "IN-PROCESS",
        shift: "1ST",
        yieldRate: 99.99
      },
      {
        productionLineName: "M2-Borche-700T",
        workOrderNumber: "WO1",
        productionLineModal: "Borche-700T",
        targetProduction: 6000,
        actualProduction: 2000,
        targetTotalProduction: 600000,
        actualTotalProduction: 60000,
        productionStatus: "IN-PROCESS",
        shift: "2ND",
        yieldRate: 99.98
      }
    );
  }
}
