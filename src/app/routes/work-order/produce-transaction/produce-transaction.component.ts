import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms'; 
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { ProductionLine } from '../models/production-line';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderProduceTransactionService } from '../services/work-order-produce-transaction.service';

@Component({
    selector: 'app-work-order-produce-transaction',
    templateUrl: './produce-transaction.component.html',
    styleUrls: ['./produce-transaction.component.less'],
    standalone: false
})
export class WorkOrderProduceTransactionComponent implements OnInit {
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
 
  isSpinning = false; 
  isCollapse = false;

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  searchResult = '';

  // Table data for display
  workOrderProduceTransaction: WorkOrderProduceTransaction[] = []; 
  productionLines: ProductionLine[] = [];
    
  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private workOrderProduceTransactionService: WorkOrderProduceTransactionService, 
    private userService: UserService,
    private titleService: TitleService, 
    private productionLineService: ProductionLineService
  ) {
    
    userService.isCurrentPageDisplayOnly("/work-order/produce-transaction").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                                      
  

  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.wo-produce-transaction'));
    // initiate the search form
    this.searchForm = this.fb.group({
      workOrderNumber: [null],
      productionLineId: [null], 
    });
 

    // initiate the select control
    this.productionLineService.getProductionLines().subscribe({
      next: (productionLineRes) => this.productionLines = productionLineRes
    })
  }

  toggleCollapse() {
    this.isCollapse = !this.isCollapse;
  }
  resetForm(): void {
    this.searchForm.reset();
    this.workOrderProduceTransaction = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.workOrderProduceTransactionService
      .getWorkOrderProduceTransaction(this.searchForm.value.workOrderNumber, this.searchForm.value.productionLineId)
      .subscribe(
        produceTransactionRes => {
          this.workOrderProduceTransaction = produceTransactionRes; 
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: produceTransactionRes.length
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      );
  }
  

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("thumbnail"), type: 'img',index: 'thumbnailUrl', iif: () => this.isChoose('thumbnail'), },
    { title: this.i18n.fanyi("name"), index: 'name', iif: () => this.isChoose('name'), },
    { title: this.i18n.fanyi("description"), index: 'description', iif: () => this.isChoose('description'), },
    { title: this.i18n.fanyi("client"), index: 'client.name', iif: () => this.isChoose('client'), },
    { title: this.i18n.fanyi("item-family"), index: 'itemFamily.name', iif: () => this.isChoose('item-family'), },
    { title: this.i18n.fanyi("unit-cost"), index: 'unitCost', iif: () => this.isChoose('unit-cost'), },
    { title: this.i18n.fanyi("allowAllocationByLPN"), index: 'allowAllocationByLPN', iif: () => this.isChoose('allowAllocationByLPN'), },
    { title: this.i18n.fanyi("allocationRoundUpStrategyType"), index: 'allocationRoundUpStrategyType', iif: () => this.isChoose('allocationRoundUpStrategyType'), },
    { title: this.i18n.fanyi("allocationRoundUpStrategyValue"), index: 'allocationRoundUpStrategyValue', iif: () => this.isChoose('allocationRoundUpStrategyValue'), },
    { title: this.i18n.fanyi("trackingVolumeFlag"), index: 'trackingVolumeFlag', iif: () => this.isChoose('trackingVolumeFlag'), },
    { title: this.i18n.fanyi("trackingLotNumberFlag"), index: 'trackingLotNumberFlag', iif: () => this.isChoose('trackingLotNumberFlag'), },
    { title: this.i18n.fanyi("trackingManufactureDateFlag"), index: 'trackingManufactureDateFlag', iif: () => this.isChoose('trackingManufactureDateFlag'), },
    { title: this.i18n.fanyi("shelfLifeDays"), index: 'shelfLifeDays', iif: () => this.isChoose('shelfLifeDays'), },
    { title: this.i18n.fanyi("trackingExpirationDateFlag"), index: 'trackingExpirationDateFlag', iif: () => this.isChoose('trackingExpirationDateFlag'), },
  ];
  customColumns = [

    { label: this.i18n.fanyi("thumbnail"), value: 'thumbnail', checked: true },
    { label: this.i18n.fanyi("name"), value: 'name', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("client"), value: 'client', checked: true },
    { label: this.i18n.fanyi("item-family"), value: 'item-family', checked: true },
    { label: this.i18n.fanyi("unit-cost"), value: 'unit-cost', checked: true },
    { label: this.i18n.fanyi("allowAllocationByLPN"), value: 'allowAllocationByLPN', checked: true },
    { label: this.i18n.fanyi("allocationRoundUpStrategyType"), value: 'allocationRoundUpStrategyType', checked: true },
    { label: this.i18n.fanyi("allocationRoundUpStrategyValue"), value: 'allocationRoundUpStrategyValue', checked: true },
    { label: this.i18n.fanyi("trackingVolumeFlag"), value: 'trackingVolumeFlag', checked: true },
    { label: this.i18n.fanyi("trackingLotNumberFlag"), value: 'trackingLotNumberFlag', checked: true },
    { label: this.i18n.fanyi("trackingManufactureDateFlag"), value: 'trackingManufactureDateFlag', checked: true },
    { label: this.i18n.fanyi("shelfLifeDays"), value: 'shelfLifeDays', checked: true },
    { label: this.i18n.fanyi("trackingExpirationDateFlag"), value: 'trackingExpirationDateFlag', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{
    console.log(`my model changed!\n ${JSON.stringify(this.customColumns)}`);
    if (this.st.columns !== undefined) {
      this.st.resetColumns({ emitReload: true });

    }
  }
}
