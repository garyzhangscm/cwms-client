import { inject , ChangeDetectorRef, Component, OnInit, ViewChild, OnDestroy, } from '@angular/core';
import { I18NService } from '@core';
import { STChange, STColumn, STComponent, STPage, } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize, interval, Subscription, timeout } from 'rxjs';

import { UserService } from '../../auth/services/user.service';
import { ProductionLineKanbanData } from '../../work-order/models/production-line-kanban-data';
import { ProductionLineKanbanService } from '../../work-order/services/production-line-kanban.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineService } from '../services/production-line.service';


@Component({
    selector: 'app-dashboard-production-kanban',
    templateUrl: './production-kanban.component.html',
    styleUrls: ['./production-kanban.component.less'],
    standalone: false
})
export class WorkOrderProductionKanbanComponent implements OnInit, OnDestroy {
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  productionLineKanbanDataList: ProductionLineKanbanData[] = [];
  displayProductionLineKanbanDataList: ProductionLineKanbanData[] = [];
  productionLines: ProductionLine[] = [];
  

  showProductionLineSet = new Set<string>();
  hideProductionLineSelection = true;
  loadingData = false;
  loadError = '';
  private productionLinesLoaded = false;
  private readonly requestTimeoutMs = 30000;
  private productionLinesSubscription?: Subscription;
  private kanbanSubscription?: Subscription;
 

  countDownNumber = 300;
  countDownsubscription!: Subscription;
  displayOnly = false;
  constructor(
    public msg: NzMessageService, private cdr: ChangeDetectorRef,
    private productionLineKanbanService: ProductionLineKanbanService,
    private productionLineService: ProductionLineService,
    private userService: UserService,) {
      userService.isCurrentPageDisplayOnly("/work-order/production-kanban").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                      
     
  }

  ngOnInit(): void {
    

    this.resetCountDownNumber();

    
    this.loadProductionLines();
    this.countDownsubscription = interval(1000).subscribe(x => {
      this.handleCountDownEvent();
    })

  }
  ngOnDestroy() {
    this.countDownsubscription?.unsubscribe();
    this.productionLinesSubscription?.unsubscribe();
    this.kanbanSubscription?.unsubscribe();
  }

  loadProductionLines(): void {
    this.productionLinesSubscription?.unsubscribe();
    this.kanbanSubscription?.unsubscribe();
    this.loadingData = true;
    this.loadError = '';
    // Selection needs only line names; work order and inventory details are loaded by the kanban API.
    this.productionLinesSubscription = this.productionLineService
      .getProductionLines(undefined, undefined, false, false)
      .pipe(timeout(this.requestTimeoutMs))
      .subscribe({
        next: productionLines => {
          this.productionLines = productionLines;
          this.productionLinesLoaded = true;
          this.showProductionLineSet = new Set(productionLines.map(line => line.name));
          this.loadKanbanData();
        },
        error: () => {
          this.loadingData = false;
          this.loadError = 'Unable to load production lines. Please retry.';
          this.resetCountDownNumber();
        }
      });
  }

  retryLoad(): void {
    if (this.productionLinesLoaded) this.loadKanbanData();
    else this.loadProductionLines();
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
    this.st.pi = 1;
    this.loadKanbanData();
  }
  handleCountDownEvent(): void {
    // don't count down when we are loading data
    if (this.loadingData) {
      
      this.resetCountDownNumber();
      return;
    }
    this.countDownNumber--;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();
      this.loadKanbanData();
    }
  }
  resetCountDownNumber() {
    this.countDownNumber = 300;
  }
  loadKanbanData(): void {
    if (!this.productionLinesLoaded) return;
    // Cancel an earlier page request so a late response cannot overwrite the current page.
    this.kanbanSubscription?.unsubscribe();
    this.loadError = '';
    const selectedProductionLineNames = this.getSelectedProductionLineNamesByPage()
      .map(line => line.name).join(',');
    this.st.total = this.showProductionLineSet.size;
    if (!selectedProductionLineNames) {
      this.productionLineKanbanDataList = [];
      this.refreshKanbanData();
      this.loadingData = false;
      this.resetCountDownNumber();
      return;
    }
    this.loadingData = true;
    this.kanbanSubscription = this.productionLineKanbanService
      .getProductionLineKanbanData(undefined, selectedProductionLineNames)
      .pipe(
        timeout(this.requestTimeoutMs),
        finalize(() => {
          this.loadingData = false;
          this.resetCountDownNumber();
        })
      )
      .subscribe({
        next: data => {
          this.productionLineKanbanDataList = data.map(row => ({
            ...row,
            percent: row.productionLineTargetOutput > 0
              ? row.productionLineActualOutput * 100 / row.productionLineTargetOutput : 0
          }));
          this.refreshKanbanData();
        },
        error: () => {
          this.loadError = 'Unable to refresh production data. Please retry. Previously loaded data may be out of date.';
        }
      });
  }

  getSelectedProductionLineNamesByPage(): ProductionLine[] {
    const lines = this.productionLines.filter(line => this.showProductionLineSet.has(line.name));
    const pageSize = Math.max(1, this.st.ps);
    const lastPage = Math.max(1, Math.ceil(lines.length / pageSize));
    this.st.pi = Math.min(Math.max(1, this.st.pi), lastPage);
    const start = (this.st.pi - 1) * pageSize;
    return lines.slice(start, start + pageSize);
  }
  toggleProductionLineDisplay() {
    this.hideProductionLineSelection = !this.hideProductionLineSelection;
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  
  page: STPage = {
    front: false,
    total: true,
    show: true,
  };
  
  columns: STColumn[] = [
    { title: this.i18n.fanyi("production-line.name"), index: 'productionLineName', iif: () => this.isChoose('productionLineName'), },
    { title: this.i18n.fanyi("work-order.number"), index: 'workOrderNumber', iif: () => this.isChoose('workOrderNumber'), },
    { title: this.i18n.fanyi("item.name"), index: 'itemName', iif: () => this.isChoose('itemName'), },
    { title: this.i18n.fanyi("production-line.enabled"), index: 'productionLineEnabled', iif: () => this.isChoose('productionLineEnabled'), },
    
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
    { label: this.i18n.fanyi("production-line.enabled"), value: 'productionLineEnabled', checked: true },
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

  columnChoosingChanged(): void{ 
    if (this.st.columns !== undefined) {
      this.st.resetColumns({ emitReload: true });

    }
  }

  kanbanDataTableChanged(e: STChange): void {
    if (e.type === 'pi' || e.type === 'ps') {
      this.loadKanbanData();
    }
  }
}
