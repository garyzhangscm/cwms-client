import { inject , ChangeDetectorRef, Component, OnInit, ViewChild, OnDestroy, } from '@angular/core';
import { I18NService } from '@core';
import { STChange, STColumn, STComponent, STPage, } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { interval, Subscription } from 'rxjs';

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
    
    this.st.page.front = false;
    this.resetCountDownNumber();

    
    this.loadProductionLines();
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
        this.loadKanbanData();

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
  loadKanbanData() {
    // only show the selected produciton lines
    this.loadingData = true;

    const selectedProductionLineNames = this.getSelectedProductionLineNamesByPage().map(
      productionLine => productionLine.name
    ).join(',');
    
    // this.st.page.total = this.showProductionLineSet.size.toString();
    this.st.total = this.showProductionLineSet.size;
    console.log(`selectedProductionLineNames:\n ${selectedProductionLineNames}`);
    console.log(`this.st.page.total:\n ${this.st.page.total}`);
    if (selectedProductionLineNames === '') {
      this.productionLineKanbanDataList = [];
      this.loadingData = false;
    }
    else {

      this.productionLineKanbanService.getProductionLineKanbanData(undefined, selectedProductionLineNames)
      .subscribe(productionLineKanbanDataRes => {
        this.productionLineKanbanDataList = productionLineKanbanDataRes;
        this.productionLineKanbanDataList.forEach(
          productionLineKanbanData =>
            productionLineKanbanData.percent = (
              productionLineKanbanData.productionLineActualOutput * 100 / productionLineKanbanData.productionLineTargetOutput
            )
        )
        this.refreshKanbanData();
        this.loadingData = false;
      });
    }

  }

  getSelectedProductionLineNamesByPage(): ProductionLine[]{
    console.log(`start to load data for page: ${this.st.pi}, ${this.st.ps} record per page`);

    // step 1: get all selected production line
    const selectedProductionLines : ProductionLine[] = this.productionLines.filter(
      productionLine => this.showProductionLineSet.has(productionLine.name)
    );
    console.log(`selectedProductionLines:\n ${JSON.stringify(selectedProductionLines)}`);

    // step 2: we will get record from ((page# -1) * record/page) to (page# * record/page - 1)  
    let startIndex =  (this.st.pi - 1) * this.st.ps;
    
    // if we are out of range, then just return the last page
    if (startIndex > selectedProductionLines.length - 1) {

      startIndex = selectedProductionLines.length > this.st.ps ? 
          selectedProductionLines.length - this.st.ps : 0;
    }

    let endIndex = this.st.pi * this.st.ps - 1;
    if (endIndex > selectedProductionLines.length - 1) {
      endIndex = selectedProductionLines.length - 1;
    }
    console.log(`start index: ${startIndex}, end index: ${endIndex}`);

    return selectedProductionLines.slice(startIndex, endIndex + 1);


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
    console.log(e);
    if (e.type === 'pi') {
      this.loadKanbanData();
    }
  }
}
