import { Component,  OnInit,  } from '@angular/core';
import { FormBuilder , FormGroup } from '@angular/forms';
import { _HttpClient } from '@delon/theme'; 
import {  ChartSelectionChangedEvent, ChartType, Row } from 'angular-google-charts';
import { differenceInCalendarDays, addDays, parseISO, Interval} from 'date-fns';

import { ColorService } from '../../style/color.service';
import { UtilService } from '../../util/services/util.service';
import { MasterProductionScheduleLineDate } from '../models/master-production-schedule-line-date';
import { ProductionLine } from '../models/production-line';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';
import { ProductionLineService } from '../services/production-line.service';

declare function afterDraw(): Function;

// MPS in chart format for better display and export
export interface MPSChartData {
  productionLineName: string;
  itemName: string;
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
 

@Component({ 
  selector: 'app-work-order-mps-view',
  templateUrl: './mps-view.component.html',
  styleUrls: ['./mps-view.component.less'],   
  providers: [ColorService]
})
export class WorkOrderMpsViewComponent implements OnInit {
  

  isSpinning = false;
  
  searchForm!: FormGroup;
  availableProductionLines: ProductionLine[] = []; 

  // default we will show 90 days record 
  defaultDaySpan = 90;

  chartType = ChartType.Timeline;
  // data for display in the google chart
  chartData: Row[] = [];
  // meta data for chart and export
  mpsChartData: MPSChartData[] = []
  
  // mps by item view, used for export to excel
  mpsByItemViewData: MPSByItemView[] = [];
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
 
   
  constructor(private http: _HttpClient, 
    private fb: FormBuilder,
    private masterProductionScheduleService: MasterProductionScheduleService,  
    private productionLineService: ProductionLineService, private utilService: UtilService) { }

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

  resetForm(): void {
    this.searchForm.reset();
    this.chartData = [];
    this.colorByItemMap.clear();
    

  }
  
  search(): void {
    this.isSpinning = true; 
    
    this.chartData = [];
    this.mpsChartData = [];
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
    
    let startTime : Date = this.searchForm.controls.mpsDateTimeRanger.value ? 
        this.searchForm.controls.mpsDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.mpsDateTimeRanger.value ? 
        this.searchForm.controls.mpsDateTimeRanger.value[1] : undefined;

      
    this.masterProductionScheduleService.getMasterProductionSchedules(      
      this.searchForm.controls.number.value,  
      undefined, 
      undefined,
      this.searchForm.controls.productionLines.value,  
      this.searchForm.controls.itemName.value, 
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
              this.searchForm.controls.productionLines.value == null ||
                String(this.searchForm.controls.productionLines.value).split(",").some(
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
                            itemName: mps.item!.name,   
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
              this.mpsChartData = [
                  ...this.mpsChartData,
                  {
                      productionLineName: lastMPSDate.productionLineName!,
                      itemName: lastMPSDate.itemName!,
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
                
                this.mpsChartData = [
                  ...this.mpsChartData,
                  {
                      productionLineName: lastMPSDate.productionLineName!,
                      itemName: lastMPSDate.itemName!,
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
    this.searchForm.controls.itemName.setValue(selectedItemName);
  }

  onSelect(event: ChartSelectionChangedEvent ){

    console.log(`onselect: ${JSON.stringify(event)}`)
  }
  onGoogleChartReady() {
    console.log(`onGoogleChartReady, start to call afterDraw`);
    // afterDraw() 
  } 

  exportByItem() {
    this.fillDataForExportByItem();

  }
  fillDataForExportByItem() {
    // sort the meta data by item name
    this.mpsChartData.sort((a, b) => {

      if (a.itemName == b.itemName) {
        return a.productionLineName.localeCompare(b.productionLineName)
      }
      else {
        return a.itemName.localeCompare(b.itemName)
      }
    })
    // see how many production line per item, as we will need to group by 
    // production line and get a total number of the item
    let lastItemName: string = "";
    let lastProductionLineName: string = "";
    let lastMPSByItemViewData: MPSByItemView;
    this.mpsChartData.forEach(
      singleMPSChartData => {
        if (lastMPSByItemViewData ==  null) {
          lastMPSByItemViewData = {
            
            itemName: singleMPSChartData.itemName,
            totalLines: 1,
            lineNumber: 0,
            totalQuantity: singleMPSChartData.dailyQuantity,
            goalQuantity: singleMPSChartData.dailyQuantity,
            productionLineName: singleMPSChartData.productionLineName,
            productionDays: singleMPSChartData.;
          }
        }
        if (lastItemName == singleMPSChartData.itemName &&
            lastProductionLineName == singleMPSChartData.productionLineName) {
          // ok, we are still process the same item and same production line, 
          // we will have multiple mps record when there're difference in the
          // daily quantity for the same item and production line
          // if we havn't create the MPSByItemView data yet,
          // created it, otherwise, add to it
          if (lastMPSByItemViewData) {
            lastMPSByItemViewData.goalQuantity = lastMPSByItemViewData.goalQuantity +
                singleMPSChartData.dailyQuantity;
            lastMPSByItemViewData.totalQuantity = lastMPSByItemViewData.totalQuantity +
                singleMPSChartData.dailyQuantity;
          } 
        }

      }
    )

  }

  exportByProductionLine(){
    
  }
}
 
