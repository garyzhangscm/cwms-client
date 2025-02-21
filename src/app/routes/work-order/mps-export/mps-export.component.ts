import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import * as XLSX from 'xlsx';

import { MasterProductionSchedule } from '../models/master-production-schedule';
import { MasterProductionScheduleLineDate } from '../models/master-production-schedule-line-date';
import { MPSExportType } from '../models/mps-export-type';
import { ProductionLine } from '../models/production-line';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';
import { ProductionLineService } from '../services/production-line.service';


export interface MPSByItemView{
  itemName: string;
  totalLines: number;
  lineNumber: number;
  totalQuantity: number;
  goalQuantity: number;
  productionLineName: string;
  productionDays: number;
}

 
//
//  OBSOLETED!!!!
//
//
@Component({
    selector: 'app-work-order-mps-export',
    templateUrl: './mps-export.component.html',
    standalone: false
})
export class WorkOrderMpsExportComponent implements OnInit {

  isSpinning = false;
  availableProductionLines: ProductionLine[] = []; 
  searchForm!: UntypedFormGroup;
  exportType = MPSExportType.BY_PRODUCTION_LINE; 
  mpsExportTypes = MPSExportType;
  
  listOfAllMPSs: MasterProductionSchedule[] = [];
  mpsByItemViewData: MPSByItemView[] = [];
  
  constructor(private http: _HttpClient, 
    private fb: UntypedFormBuilder,
    private masterProductionScheduleService: MasterProductionScheduleService,  
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private productionLineService: ProductionLineService, private xlsx: XlsxService) { }

  ngOnInit(): void { 
    this.searchForm = this.fb.group({ 
      productionLines: [null],
      dateRanger: [null],
    });
    
    this.mpsByItemViewData = [];

    this.initiatePorductionLines();
  }
  
  initiatePorductionLines() {
    this.isSpinning = true;
    this.productionLineService.getProductionLines().subscribe(
      {
        next: (productionLines) => {
          this.availableProductionLines = productionLines; 
          this.isSpinning = false;
        }, 
      }
    );
    
  } 
  readyForSearch() : boolean{
    
     
    return  this.searchForm.controls.productionLines.value != null ||
                this.searchForm.controls.dateRanger.value  != null

  }
  search() { 
    this.isSpinning = true;
    let startTime : Date = this.searchForm.controls.dateRanger.value ? 
        this.searchForm.controls.dateRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.dateRanger.value ? 
        this.searchForm.controls.dateRanger.value[1] : undefined;  


    this.masterProductionScheduleService.getMasterProductionSchedules(
      undefined, undefined, undefined,
      this.searchForm.controls.productionLines.value, undefined,     
      startTime, endTime,
    ).subscribe({
      next: (masterProductionScheduleRes) => {
        this.listOfAllMPSs = masterProductionScheduleRes;
        this.filterMPS(this.searchForm.controls.productionLines.value, startTime, endTime);
        this.setupMPSView();
        
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    })
    

  }
  filterMPS(productionLineIds?: string,    
    beginDateTime?: Date,
    endDateTime?: Date,) {
    
    // first, filter by production line, if needed
    if (productionLineIds) {

      const productionLineIdArray = productionLineIds.split(",");

      this.listOfAllMPSs.forEach(
        mps => {
          mps.masterProductionScheduleLines = mps.masterProductionScheduleLines.filter(
            masterProductionScheduleLine => productionLineIdArray.some(
              productionLineId => +productionLineId === masterProductionScheduleLine.productionLine.id!
            )
          )
        }
      )
      
    }
    // second, filter by date range, if needed
    if (beginDateTime || endDateTime) {
      
      this.listOfAllMPSs.forEach(
        mps => {
          mps.masterProductionScheduleLines.forEach(
            masterProductionScheduleLine => {
              
            }
          )
        }
      )
    }
    
  }
  
  setupMPSView() {
    switch(this.exportType) {
      case MPSExportType.BY_ITEM:
        this.setupMPSByItemView();
        break;
      default:
        this.setupMPSByProductionLineView();
        break;
    }
  }
  setupMPSByItemView() {
    // clear the result first
    this.mpsByItemViewData = [];
    
    // key: item id - production line id
    // value: list of MasterProductionScheduleLineDate so we can get the date range
    //        and total quantity
    let mpsDetailMap: Map<String, MasterProductionScheduleLineDate[]> = new Map();
    let itemNameMap: Map<number, string> = new Map();
    // save the production line information
    let productionLineMap: Map<number, string> = new Map();
    // save the total quantity for the item
    let itemQuantityMap: Map<number, number> = new Map();
    // how many productoin line per item. we will need this number
    // to merge the cell of the item name so when we have
    // one single cell for the item for multiple lines
    let itemTotalLinesCount: Map<number, number> = new Map();
    // save the total quantity for the item and production line
    // key: item id - production line id
    // value: total planned quantity
    let itemProductionLineQuantityMap: Map<String, number> = new Map();

    this.listOfAllMPSs.forEach(
      mps => {
        let itemId: number = mps.itemId!;
        itemNameMap.set(itemId,  mps.item!.name);
        
        itemTotalLinesCount.set(itemId, mps.masterProductionScheduleLines.length);

        mps.masterProductionScheduleLines.forEach(
          masterProductionScheduleLine => {
              let productionLineId: number = masterProductionScheduleLine.productionLine.id!;
              productionLineMap.set(productionLineId,
                      masterProductionScheduleLine.productionLine.name);

              let masterProductionScheduleLineDates: MasterProductionScheduleLineDate[] = [];
              if (mpsDetailMap.has(`${itemId}-${productionLineId}`)) {
                masterProductionScheduleLineDates = 
                mpsDetailMap.get(`${itemId}-${productionLineId}`)!;
              }
              masterProductionScheduleLineDates = [
                ...masterProductionScheduleLineDates, 
                ...masterProductionScheduleLine.masterProductionScheduleLineDates
              ];
              mpsDetailMap.set(`${itemId}-${productionLineId}`, masterProductionScheduleLineDates);

              let totalItemQuantity = itemQuantityMap.has(itemId) ?
                  itemQuantityMap.get(itemId)! : 0; 
              let itemProductionLineQuantity =  
                  masterProductionScheduleLine.masterProductionScheduleLineDates.map(
                    masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity
                  ).reduce((acc, cur) => acc + cur, 0); 
              
              itemQuantityMap.set(itemId, totalItemQuantity + itemProductionLineQuantity);
              itemProductionLineQuantityMap.set(`${itemId}-${productionLineId}`, itemProductionLineQuantity)
               

          }
        );
      }
    );

    let itemLineNumber: number = 0; 
    let lastItemId: number;
    mpsDetailMap.forEach(
      (masterProductionScheduleLineDates, key) => { 
        // key: item id - production line id
        let itemIdAndProductionLineId: string[] = key.split("-");
        let itemId: number = +itemIdAndProductionLineId[0];
        let productionLineId: number = +itemIdAndProductionLineId[1];
        // start from line 0 if this is the new item
        // count the line number if we already processed the same item
        // but probably different production line
        if (lastItemId == null) {
          itemLineNumber = 0;
          lastItemId = itemId;
        }
        else if (lastItemId === itemId) {
          itemLineNumber = itemLineNumber + 1;
        }
        else {
          itemLineNumber = 0;
          lastItemId = itemId;
        }
        
        this.mpsByItemViewData = [
          ...this.mpsByItemViewData, 
          {
            
            itemName: itemNameMap.get(itemId)!,
            totalLines: itemTotalLinesCount.get(itemId)!,
            lineNumber: itemLineNumber,
            totalQuantity: itemQuantityMap.get(itemId)!,
            goalQuantity: itemProductionLineQuantityMap.get(key)!,
            productionLineName: productionLineMap.get(productionLineId)!,
            productionDays: masterProductionScheduleLineDates.length,
          }
        ]
      }
    )


  }
  setupMPSByProductionLineView() {

  } 

  @ViewChild('tableWrapper', { static: false }) tableWrapper?: ElementRef;

  export(): void {
		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tableWrapper!.nativeElement);

    var wscols = [
        {wch:20},
        {wch:20},
        {wch:20},
        {wch:20},
        {wch:20}
    ];
    
    ws['!cols'] = wscols;

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'mps');

		/* save to file */
		XLSX.writeFile(wb,"mps_export.xlsx");
	}

}
