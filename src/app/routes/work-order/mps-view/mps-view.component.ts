import { Component,  ElementRef,  OnInit, ViewChild,  } from '@angular/core';
import { UntypedFormBuilder , UntypedFormGroup } from '@angular/forms';
import { _HttpClient } from '@delon/theme'; 
import {  ChartSelectionChangedEvent, ChartType, Row } from 'angular-google-charts';
import { differenceInCalendarDays, addDays, parseISO, Interval} from 'date-fns';
import * as XLSX from 'xlsx';

import { UserService } from '../../auth/services/user.service';
import { ColorService } from '../../style/color.service';
import { UtilService } from '../../util/services/util.service';
import { MasterProductionScheduleLineDate } from '../models/master-production-schedule-line-date';
import { ProductionLine } from '../models/production-line';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';
import { ProductionLineService } from '../services/production-line.service';

declare function afterDraw(): Function;

// MPS in chart format for better display and export
export interface MPSChartRawData {
  itemId: number;
  itemName: string;
  productionLineId: number;
  productionLineName: string;
  mpsNumber: string;
  dailyQuantity: number;
  totalQuantity: number; 
  startDate: Date;
  endDate: Date; 
}

export interface ChartOptions {

  colors: string[];
        
  hAxis: {
    format: string, 
  }
}


export interface MPSByItemView{
  itemName: string;
  totalLines: number;
  lineNumber: number;
  totalQuantity: number;
  goalQuantity: number;
  productionLineName: string;
  productionDays: number;
}
 

export interface MPSByProductionLineView{
  productionLineName: string;
  dateRange: string;
  productionDays: number;
  itemName: string;
  goalQuantity: number;
  totalLines: number;
  lineNumber: number;
}
 

@Component({
    selector: 'app-work-order-mps-view',
    templateUrl: './mps-view.component.html',
    styleUrls: ['./mps-view.component.less'],
    providers: [ColorService],
    standalone: false
})
export class WorkOrderMpsViewComponent implements OnInit {
  

  isSpinning = false;
  
  searchForm!: UntypedFormGroup;
  availableProductionLines: ProductionLine[] = []; 

  // default we will show 90 days record 
  defaultDaySpan = 90;

  chartType = ChartType.Timeline;
  // data for display in the google chart
  chartData: Row[] = [];
  // meta data for chart and export
  mpsChartRawData: MPSChartRawData[] = []
  
  // mps by item & production line view, used for export to excel
  mpsByItemViewData: MPSByItemView[] = [];
  mpsByProductionLineViewData: MPSByProductionLineView[] = [];

  chartWidth: number = 5000;
  chartColumns = [
    { type: 'string', id: 'Role' },
    { type: 'string', role: 'Name' },
    { type: 'string', id: 'style', role: 'style' },
    { type: 'date', id: 'Start' },
    { type: 'date', id: 'End' }
  ];
  validColors = ['#ff0000', '#FFA500', '#FFFF00', '#800080', '#008000',
                '#0000FF', '#A52A2A', '#ff0000', '#FFA500', '#FFFF00',
                '#800080', '#008000', '#0000FF', '#A52A2A', '#ff0000'];
  colorByItemMap = new Map<string, string>(); 
  chartOptions?: ChartOptions;
 
   
  displayOnly = false;
  constructor(private http: _HttpClient, 
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private masterProductionScheduleService: MasterProductionScheduleService,  
    private productionLineService: ProductionLineService, private utilService: UtilService) { 
      
      userService.isCurrentPageDisplayOnly("/work-order/mps-view").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                      

    }

  ngOnInit(): void {  
     
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      itemName: [null],
      productionLines: [null],
      mpsDateTimeRanger:[null],
    });

    this.initiatePorductionLines();
  }
  
  
  initiatePorductionLines() {
    // this.isSpinning = true;
    this.productionLineService.getProductionLines().subscribe(
      {
        next: (productionLines) => {
          this.availableProductionLines = productionLines; 
          this.isSpinning = false;
        }, 
      }
    );
    
  } 

  resetForm(): void {
    this.searchForm.reset();
    this.chartData = [];
    this.colorByItemMap.clear();
    

  }
  
  search(): void {
    this.isSpinning = true; 
    
    this.chartData = [];
    this.mpsChartRawData = [];
    this.colorByItemMap.clear();

    // by default, we will show date start from today, 
    /***
     * 
    let startTime : Date = this.searchForm.controls.mpsDateTimeRanger.value ? 
        this.searchForm.controls.mpsDateTimeRanger.value[0] : new Date(); 
    let endTime : Date = this.searchForm.controls.mpsDateTimeRanger.value ? 
        this.searchForm.controls.mpsDateTimeRanger.value[1] : 
        addDays(startTime, this.defaultDaySpan); 
     * 
     */
    
    let startTime : Date = this.searchForm.value.mpsDateTimeRanger ? 
        this.searchForm.value.mpsDateTimeRanger.value[0] : addDays(new Date(), -2000); 
    let endTime : Date = this.searchForm.value.mpsDateTimeRanger ? 
        this.searchForm.value.mpsDateTimeRanger.value[1] : addDays(new Date(), 2000); 

      
    this.masterProductionScheduleService.getMasterProductionSchedules(      
      this.searchForm.value.number,  
      undefined, 
      undefined,
      this.searchForm.value.productionLines,  
      this.searchForm.value.itemName, 
      startTime, 
      endTime 
    ).subscribe({
      next: (mpsRes) => { 
        // actual min start time and max end time
        // so we can narrow down the timeline that we will show in the google chart
        let minStartTime = endTime;
        let maxEndTime = startTime;

        let mpsDates: MasterProductionScheduleLineDate[] = [];
        mpsRes.forEach(
          mps => {
            // see if we ill need to filter by production
            // console.log(`mps.masterProductionScheduleLines.length: ${mps.masterProductionScheduleLines.length}`)

            // first, we will filter out the result by production line, if the user query by production line
            mps.masterProductionScheduleLines.filter(
              masterProductionScheduleLine => 
              this.searchForm.value.productionLines == null ||
                String(this.searchForm.value.productionLines).split(",").some(
                  productoinLineId => +productoinLineId === masterProductionScheduleLine.productionLine.id!
                ) 
            ).forEach(
              masterProductionScheduleLine => {
                
                masterProductionScheduleLine.masterProductionScheduleLineDates
                // only return the records that between the start time and end time
                .filter(
                  masterProductionScheduleLineDate =>  
                     
                      differenceInCalendarDays(
                        parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10)), startTime) >= 0 &&
                      differenceInCalendarDays(endTime, 
                        parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10))) >= 0 
                        
                )
                .forEach(                  
                  masterProductionScheduleLineDate =>
                      {
                        const plannedDate = parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10));
                        
                        // save the raw date first. The line date saved in the server will be on single date
                        // we will need to generate date range based on those single dates and then
                        // show by range in the chart
                        mpsDates = [
                          ...mpsDates,
                          {
                            plannedQuantity: masterProductionScheduleLineDate.plannedQuantity,
                            plannedDate: masterProductionScheduleLineDate.plannedDate,
                        
                            // used for MPS display
                            productionLineName: masterProductionScheduleLine.productionLine.name, 
                            productionLineId: masterProductionScheduleLine.productionLine.id,
                            itemName: mps.item!.name,   
                            itemId: mps.itemId,
                            mpsNumber: mps.number
                          }];
                        if (differenceInCalendarDays(plannedDate, minStartTime) < 0) {
                            minStartTime = plannedDate;
                        }
                        if (differenceInCalendarDays(plannedDate, maxEndTime) > 0) {
                          maxEndTime = plannedDate;
                        }
                      }
                )

              }
            )
          }
        )
        
        // console.log(`before sort we get this.mpsDates: ${JSON.stringify(mpsDates)}`);
        // we will sort the raw data first
        // 1. first by production line
        // 2. second by the planned date
        // so that we can show bar separated by production line, and then by date range for each item
        mpsDates.sort((mpsDate1, mpsDate2) => {
          if (this.utilService.compareNullableString(mpsDate1.productionLineName, mpsDate2.productionLineName) == 0) {
            return differenceInCalendarDays(
                parseISO(mpsDate1.plannedDate.toString().substring(0, 10)),
                parseISO(mpsDate2.plannedDate.toString().substring(0, 10)))
          }
          else {
            return this.utilService.compareNullableString(mpsDate1.productionLineName, mpsDate2.productionLineName);
          }
        })
        // console.log(`after sort we get this.mpsDates: ${JSON.stringify(mpsDates)}`);
        // save the result to the chart data so we can display 
        let interval: Interval | undefined;
        let lastMPSDate: MasterProductionScheduleLineDate | undefined;
        let totalPlannedQuantity = 0;
        this.colorByItemMap.clear();
        let barColors: string[] = [];

        mpsDates.forEach(
          mpsDate => {
            // this is the first date in the range, let's save it first 
            // and see if it has consecutive dates with same production line and
            // item number 
            if (interval == undefined || lastMPSDate == undefined) {
              interval = {
                start: parseISO(mpsDate.plannedDate.toString().substring(0, 10)),
                end: parseISO(mpsDate.plannedDate.toString().substring(0, 10)),
              }
              lastMPSDate = mpsDate;
              totalPlannedQuantity = mpsDate.plannedQuantity
            }
            // we already have mps date saved temporary and sorted by production line and date, 
            // let's first check if 
            // the current date belongs to the same production and MPS and daily quantity as the last 
            // one, if so, we will check if the current date is next to the previous
            // MPS date's date(we can do so as we already sort the MPS date array by
            // date). If so, we will continue until we reach the end of the current date range
            // otherwise, we will close the current range, save it to the chartData
            // and continue with a new range
            else if (
              this.utilService.compareNullableString(mpsDate.productionLineName, lastMPSDate.productionLineName) == 0 &&
              this.utilService.compareNullableString(mpsDate.mpsNumber, lastMPSDate.mpsNumber) == 0 && 
              mpsDate.plannedQuantity === lastMPSDate.plannedQuantity   &&
              differenceInCalendarDays(parseISO(mpsDate.plannedDate.toString().substring(0, 10)), 
                  interval.end) === 1  
            ){
              // the current MPS date has the same production line and item as the previous one, 
              // and the date is just next to the previous saved date. let's save it and continue
              interval = {
                start: interval.start,
                end: parseISO(mpsDate.plannedDate.toString().substring(0, 10)),
              }
              totalPlannedQuantity += mpsDate.plannedQuantity
            }
            else {
              // one of the following condition fail, let's start a new range
              // 1. the current MPS date has the same production line as previous one
              // 1. the current MPS date has the same item line as previous one
              // 1. the current MPS date has the the date next to the previous one
              
              this.chartData = [
                ...this.chartData,
                  [ lastMPSDate.productionLineName!, 
                    `${lastMPSDate.itemName!}(${lastMPSDate.mpsNumber}, daily: ${lastMPSDate.plannedQuantity}, total: ${totalPlannedQuantity})`, 
                    interval.start, 
                    addDays(interval.end, 1) // the chart won't include the end date, so we will need to add one day to better show the date range
                  ],
                ];
              // console.log(`chartDate: ${JSON.stringify(this.chartData)}`)  
              this.mpsChartRawData = [
                  ...this.mpsChartRawData,
                  {
                      productionLineId: lastMPSDate.productionLineId!,    
                      productionLineName: lastMPSDate.productionLineName!,
                      itemName: lastMPSDate.itemName!,
                      itemId: lastMPSDate.itemId!,                  
                      mpsNumber: lastMPSDate.mpsNumber!,
                      dailyQuantity: lastMPSDate.plannedQuantity,
                      totalQuantity: totalPlannedQuantity, 
                      startDate: interval.start as Date, 
                      endDate: addDays(interval.end, 1) 
                  }
              ];


              // setup the color for the previous added bar
              // we will set the color by item, one color per item, regardless
              // of how many bars this item has 
              if (this.colorByItemMap.has(lastMPSDate.itemName!)) {

                barColors = [
                  ...barColors, 
                  this.colorByItemMap.get(lastMPSDate.itemName!)!                  
                ]
              }
              else {
                barColors = [
                  ...barColors, 
                  this.getColorByItem(lastMPSDate.itemName!)!                  
                ]

              }


              interval = {
                  start: parseISO(mpsDate.plannedDate.toString().substring(0, 10)),
                  end: parseISO(mpsDate.plannedDate.toString().substring(0, 10)),
              }
              lastMPSDate = mpsDate;
              totalPlannedQuantity = mpsDate.plannedQuantity
            }

          }
        );
        
        // save the last range
        if (interval != null && lastMPSDate != undefined) {
              
              this.chartData = [
                ...this.chartData,
                  [ lastMPSDate.productionLineName!, 
                    `${lastMPSDate.itemName!}(${lastMPSDate.mpsNumber}, daily: ${lastMPSDate.plannedQuantity}, total: ${totalPlannedQuantity})`, 
                    interval.start,                  
                    addDays(interval.end, 1) // the chart won't include the end date, so we will need to add one day to better show the date range
                  ],
                ];
                // console.log(`chartDate: ${JSON.stringify(this.chartData)}`)  
                
                this.mpsChartRawData = [
                  ...this.mpsChartRawData,
                  {
                      productionLineId: lastMPSDate.productionLineId!,    
                      productionLineName: lastMPSDate.productionLineName!,
                      itemName: lastMPSDate.itemName!,
                      itemId: lastMPSDate.itemId!,           
                      mpsNumber: lastMPSDate.mpsNumber!,
                      dailyQuantity: lastMPSDate.plannedQuantity,
                      totalQuantity: totalPlannedQuantity, 
                      startDate: interval.start as Date, 
                      endDate: addDays(interval.end, 1) 
                  }
              ];

              // setup the color for the previous added bar
              // we will set the color by item, one color per item, regardless
              // of how many bars this item has 

              if (this.colorByItemMap.has(lastMPSDate.itemName!)) {

                barColors = [
                  ...barColors, 
                  this.colorByItemMap.get(lastMPSDate.itemName!)!                  
                ]
              }
              else {
                barColors = [
                  ...barColors, 
                  this.getColorByItem(lastMPSDate.itemName!)!                  
                ]

              }
        } 
        
        this.chartWidth = Math.max(28 * differenceInCalendarDays(maxEndTime, minStartTime), 1500); 
        this.chartOptions = {
          colors: barColors,
              
          hAxis: {
            format: "MM/dd/yy", 
          }
        };  
        
        this.fillDataForExportByItem();
        this.fillDataForExportByProductionLine();
        this.isSpinning = false; 
      }, 
      error: () => this.isSpinning = false
    })
    /** 
     * this.chartData = [
      [ 'M1', 'ITEM-A',   new Date(2022, 1, 14), new Date(2022, 1, 18) ],
      [ 'M1', 'ITEM-A',   new Date(2022, 1, 22), new Date(2022, 1, 25) ],
      [ 'M1', 'ITEM-B',   new Date(2022, 1, 28), new Date(2022, 2, 4) ],
      [ 'M2', 'ITEM-A',   new Date(2022, 1, 14), new Date(2022, 1, 18) ],
      [ 'M2', 'ITEM-C',   new Date(2022, 1, 21), new Date(2022, 1, 28)],
      [ 'M2', 'ITEM-D',   new Date(2022, 1, 29), new Date(2022, 2, 14)],
      [ 'M2', 'ITEM-E',   new Date(2022, 2, 24), new Date(2022, 3, 4)],
      [ 'M2', 'ITEM-F',   new Date(2022, 3, 8), new Date(2022, 3, 20)],
      [ 'M3', 'ITEM-G',   new Date(2022, 1, 1), new Date(2022, 1, 15)],
      [ 'M3', 'ITEM-H',   new Date(2022, 1, 16), new Date(2022, 1, 30)],
      [ 'M3', 'ITEM-I',   new Date(2022, 2, 2), new Date(2022, 2, 5)],
      [ 'M3', 'ITEM-J',   new Date(2022, 2, 10), new Date(2022, 2, 12)],
      [ 'M3', 'ITEM-K',   new Date(2022, 2, 13), new Date(2022, 3, 5)],
      [ 'M3', 'ITEM-L',   new Date(2022, 3, 13), new Date(2022, 4, 4)],
      [ 'M3', 'ITEM-M',   new Date(2022, 4, 5), new Date(2022, 5, 1)],
      [ 'M3', 'ITEM-N',   new Date(2022, 5, 2), new Date(2022, 6, 3)]
      this.chartWidth = 28 * differenceInCalendarDays( new Date(2022, 6, 3), new Date(2022, 1, 14));
      console.log(`this.chartWidth : ${this.chartWidth}`);
    ];
     * 
    */
    
  }
  getColorByItem(itemName: string) : string { 
    // see how many colors we already used
    const usedColorCount = this.colorByItemMap.size;
    let itemColor: string = ""; 
    if (usedColorCount >= this.validColors.length) {
      itemColor =  this.validColors[usedColorCount % this.validColors.length];
    }
    else {
      itemColor = this.validColors[usedColorCount];
    } 
    // add it to the map 
    this.colorByItemMap.set(itemName, itemColor);
    return itemColor;

  }

  processItemQueryResult(selectedItemName: any): void { 
    this.searchForm.value.itemName.setValue(selectedItemName);
  }

  onSelect(event: ChartSelectionChangedEvent ){

    console.log(`onselect: ${JSON.stringify(event)}`)
  }
  onGoogleChartReady() {
    console.log(`onGoogleChartReady, start to call afterDraw`);
    // afterDraw() 
  } 

  @ViewChild('exportByItemTableWrapper', { static: false }) exportByItemTableWrapper?: ElementRef;
  @ViewChild('exportByProductionLineTableWrapper', { static: false }) exportByProductionLineTableWrapper?: ElementRef;

  exportByItem() {

    this.exportToExcel(this.exportByItemTableWrapper!.nativeElement, "mps_by_item");
  }
  fillDataForExportByItem() {
    // sort the meta data by item name
    this.mpsChartRawData.sort((a, b) => {

      if (a.itemName == b.itemName) {
        return a.productionLineName.localeCompare(b.productionLineName)
      }
      else {
        return a.itemName.localeCompare(b.itemName)
      }
    }) 
    // see how many production line per item, as we will need to group by 
    // production line and get a total number of the item

    // key: item id
    // value: item name
    let itemNameMap: Map<number, string> = new Map();
    // key: production line id
    // value: production line value
    let productionLineNameMap: Map<number, string> = new Map();
    // save the total quantity for the item
    let itemQuantityMap: Map<number, number> = new Map();
    // save the total quantity for the item and production line
    // key: item id - production line id
    // value: total planned quantity
    let itemProductionLineQuantityMap: Map<string, number> = new Map();

    // production line days
    // key: item id - production line id
    // value: total planned days
    let itemProductionLineDaysMap: Map<string, number> = new Map();

    // how many productoin line per item. we will need this number
    // to merge the cell of the item name so when we have
    // one single cell for the item for multiple lines
    // key: item id
    // value: total lines
    let itemTotalLinesCountMap: Map<number, number> = new Map();

    // variable that will be used during each loop
    let itemName = '';
    let itemId;
    let productionLineName = '';
    let productionLineId;
    let itemIdAndProductionLineId = '';

    let itemAndProductionLineQty = 0; // goal quantity
    let itemAndProductionLineDays = 0; // production days
    let itemTotalQty = 0;  // total quantity 
    let itemTotalLinesCount = 0;

    
    let processedProductionLineAndItem = new Set();

    this.mpsChartRawData.forEach(
      singleMPSChartRawData => {
        
        // get the goal quantity for item & production line that already saved 
        itemName = singleMPSChartRawData.itemName;
        itemId = singleMPSChartRawData.itemId;
        productionLineName = singleMPSChartRawData.productionLineName;
        productionLineId = singleMPSChartRawData.productionLineId;

        itemNameMap.set(itemId, itemName);
        productionLineNameMap.set(productionLineId, productionLineName);

        itemIdAndProductionLineId = `${itemId}-${productionLineId}`;
        

        // calculate how many production lines for each item
        // we use processedProductionLineAndItem set to save the production line for
        // any item and production that we alaready processed. In case the item 
        // has 2 separated date range in the same production line, we will still
        // need only one line in the exported excel 
        itemTotalLinesCount = 
            itemTotalLinesCountMap.has(itemId) ? 
              itemTotalLinesCountMap.get(itemId)! + 
              (processedProductionLineAndItem.has(itemIdAndProductionLineId) ? 0 : 1)
              :
              1; 
        itemTotalLinesCountMap.set(itemId, itemTotalLinesCount);  
        processedProductionLineAndItem.add(itemIdAndProductionLineId);

        // calculate the goal quantity for the item and production line
        itemAndProductionLineQty = 
            itemProductionLineQuantityMap.has(itemIdAndProductionLineId) ? 
                itemProductionLineQuantityMap.get(itemIdAndProductionLineId)! + singleMPSChartRawData.totalQuantity 
                :
                singleMPSChartRawData.totalQuantity;
        itemProductionLineQuantityMap.set(itemIdAndProductionLineId, itemAndProductionLineQty);
        
        // calculate the production days for the item and production line
        itemAndProductionLineDays = 
                itemProductionLineDaysMap.has(itemIdAndProductionLineId) ? 
                    itemProductionLineDaysMap.get(itemIdAndProductionLineId)! 
                        + differenceInCalendarDays(singleMPSChartRawData.endDate, singleMPSChartRawData.startDate) 
                    :
                    differenceInCalendarDays(singleMPSChartRawData.endDate, singleMPSChartRawData.startDate);
        itemProductionLineDaysMap.set(itemIdAndProductionLineId, itemAndProductionLineDays);

        
        // calculate the total quantity for the item
        itemTotalQty = 
            itemQuantityMap.has(itemId) ? 
              itemQuantityMap.get(itemId)! + singleMPSChartRawData.totalQuantity 
              :
              singleMPSChartRawData.totalQuantity;
        itemQuantityMap.set(itemId, itemTotalQty);
        
      }) 
    // local variable that will be used in the foreach loop
    let itemIdAndProductionLineIdArray: string[] = [];
    let processedItemIds = new Set();
     
    // loop through the map to generate the item table for export
    this.mpsByItemViewData = [];
    itemProductionLineQuantityMap.forEach(
      (itemProductionLineQuantity, key) => { 
        // key: item id - production line id
        itemIdAndProductionLineIdArray = key.split("-");
        if (itemIdAndProductionLineIdArray.length == 2) {
          itemId = +itemIdAndProductionLineIdArray[0]; 
          productionLineId = +itemIdAndProductionLineIdArray[1];

          itemName = itemNameMap.get(itemId)!;
          productionLineName = productionLineNameMap.get(productionLineId)!; 
          this.mpsByItemViewData = [
            ...this.mpsByItemViewData, 
            {
              itemName: itemName,
              totalLines: itemTotalLinesCountMap.get(itemId)!,
              lineNumber: processedItemIds.has(itemId) ? 1 : 0, // if the line number is 0, then we will show the item name and span it accross all the lines
              // otherwise, we won't need to show the item in the table due to the rowspan of the first record
              totalQuantity: itemQuantityMap.get(itemId)!,
              goalQuantity: itemProductionLineQuantity,
              productionLineName: productionLineName,
              productionDays: itemProductionLineDaysMap.get(key)!,
            }
          ]

          processedItemIds.add(itemId);

        }

      }
    ) 
      
    
  }

  exportByProductionLine(){
    this.exportToExcel(this.exportByProductionLineTableWrapper!.nativeElement, "mps_by_production_line");
    
  }
  
  fillDataForExportByProductionLine() {
    // sort the meta data by item name
    this.mpsChartRawData.sort((a, b) => {

      if (a.productionLineName == b.productionLineName) {
        return a.itemName.localeCompare(b.itemName)
      }
      else {
        return a.productionLineName.localeCompare(b.productionLineName)
      }
    }) 
    // see how many production line per item, as we will need to group by 
    // production line and get a total number of the item

    // key: item id
    // value: item name
    let itemNameMap: Map<number, string> = new Map();
    // key: production line id
    // value: production line value
    let productionLineNameMap: Map<number, string> = new Map();
    
    // save the total quantity for the item and production line
    // key: item id - production line id
    // value: total planned quantity
    let itemProductionLineQuantityMap: Map<string, number> = new Map();


    // production line date range
    // key: item id - production line id
    // value: total planned days
    let itemProductionLineDateRangeMap: Map<string, string> = new Map();

    // production line days
    // key: item id - production line id
    // value: total planned days
    let itemProductionLineDaysMap: Map<string, number> = new Map();

    // how many productoin line per item. we will need this number
    // to merge the cell of the item name so when we have
    // one single cell for the item for multiple lines
    // key: item id
    // value: total lines
    let productionLineTotalLinesCountMap: Map<number, number> = new Map();

    // variable that will be used during each loop
    let itemName = '';
    let itemId;
    let productionLineName = '';
    let productionLineId;
    let itemIdAndProductionLineId = '';

    let itemAndProductionLineQty = 0; // goal quantity
    let itemAndProductionLineDays = 0; // production days
    let itemAndProductionLineDateRange = ''; // production date range
    
    let productionLineTotalLinesCount = 0;
    let processedProductionLineAndItem = new Set();

    this.mpsChartRawData.forEach(
      singleMPSChartRawData => {
        
        // get the goal quantity for item & production line that already saved 
        itemName = singleMPSChartRawData.itemName;
        itemId = singleMPSChartRawData.itemId;
        productionLineName = singleMPSChartRawData.productionLineName;
        productionLineId = singleMPSChartRawData.productionLineId;

        itemNameMap.set(itemId, itemName);
        productionLineNameMap.set(productionLineId, productionLineName);

        itemIdAndProductionLineId = `${itemId}-${productionLineId}`;
        

        // calculate how many items  for each production line
        // we use processedProductionLineAndItem set to save the production line for
        // any item and production that we alaready processed. In case the item 
        // has 2 separated date range in the same production line, we will still
        // need only one line in the exported excel 
        productionLineTotalLinesCount = 
          productionLineTotalLinesCountMap.has(productionLineId) ? 
          productionLineTotalLinesCountMap.get(productionLineId)! +  
              (processedProductionLineAndItem.has(itemIdAndProductionLineId) ? 0 : 1)
              :
              1; 
        productionLineTotalLinesCountMap.set(productionLineId, productionLineTotalLinesCount);  
        processedProductionLineAndItem.add(itemIdAndProductionLineId);

        // calculate the goal quantity for the item and production line
        itemAndProductionLineQty = 
            itemProductionLineQuantityMap.has(itemIdAndProductionLineId) ? 
                itemProductionLineQuantityMap.get(itemIdAndProductionLineId)! + singleMPSChartRawData.totalQuantity 
                :
                singleMPSChartRawData.totalQuantity;
        itemProductionLineQuantityMap.set(itemIdAndProductionLineId, itemAndProductionLineQty);
        
        // calculate the production days for the item and production line
        itemAndProductionLineDays = 
                itemProductionLineDaysMap.has(itemIdAndProductionLineId) ? 
                    itemProductionLineDaysMap.get(itemIdAndProductionLineId)! 
                        + differenceInCalendarDays(singleMPSChartRawData.endDate, singleMPSChartRawData.startDate) 
                    :
                    differenceInCalendarDays(singleMPSChartRawData.endDate, singleMPSChartRawData.startDate);
        itemProductionLineDaysMap.set(itemIdAndProductionLineId, itemAndProductionLineDays);

        // calculate the production date range for the item and production line
        itemAndProductionLineDateRange =  itemProductionLineDateRangeMap.has(itemIdAndProductionLineId) ? 
              `${itemProductionLineDateRangeMap.get(itemIdAndProductionLineId)!}, ${
                   singleMPSChartRawData.startDate.toLocaleDateString()  } ~ ${ 
                        singleMPSChartRawData.endDate.toLocaleDateString()}` 
              :
              `${singleMPSChartRawData.startDate.toLocaleDateString()  } ~ ${ 
                  singleMPSChartRawData.endDate.toLocaleDateString()}`;

        itemProductionLineDateRangeMap.set(itemIdAndProductionLineId, itemAndProductionLineDateRange);
        
        
      }) 
    // local variable that will be used in the foreach loop
    let itemIdAndProductionLineIdArray: string[] = [];
    let processedProductionLineIds = new Set();
     
    // loop through the map to generate the item table for export
    this.mpsByProductionLineViewData = [];
    itemProductionLineQuantityMap.forEach(
      (itemProductionLineQuantity, key) => { 
        // key: item id - production line id
        itemIdAndProductionLineIdArray = key.split("-");
        if (itemIdAndProductionLineIdArray.length == 2) {
          itemId = +itemIdAndProductionLineIdArray[0]; 
          productionLineId = +itemIdAndProductionLineIdArray[1];

          itemName = itemNameMap.get(itemId)!;
          productionLineName = productionLineNameMap.get(productionLineId)!; 
          this.mpsByProductionLineViewData = [
            ...this.mpsByProductionLineViewData, 
            {
              productionLineName: productionLineName,
              dateRange: itemProductionLineDateRangeMap.get(key)!,
              productionDays: itemProductionLineDaysMap.get(key)!,
              itemName: itemName,
              goalQuantity: itemProductionLineQuantity,
              totalLines: productionLineTotalLinesCountMap.get(productionLineId)!,
              lineNumber: processedProductionLineIds.has(productionLineId) ? 1 : 0, // if the line number is 0, then we will show the item name and span it accross all the lines
              // otherwise, we won't need to show the item in the table due to the rowspan of the first record
            
              
            }
          ]
          processedProductionLineIds.add(productionLineId);

        }

      }
    ) 
 
    
  }


  exportToExcel(nativeTableElement: any, name: string): void {
		/* generate worksheet */
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(nativeTableElement);
		const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(nativeTableElement);

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
		XLSX.writeFile(wb,`${name}.xlsx`);
	}
}
 
