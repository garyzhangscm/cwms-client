import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { OnboardingService } from '@delon/abc/onboarding';
import { G2PieClickItem, G2PieComponent, G2PieData } from '@delon/chart/pie';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { BillableRequestSummaryByCompany } from '../../util/models/billable-request-summary-by-company';
import { BillableRequestService } from '../../util/services/billable-request.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';

@Component({
  selector: 'app-dashboard-v1',
  templateUrl: './v1.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardV1Component implements OnInit { 

  webSite!: any[];
  salesData!: any[];
  offlineChartData!: any[];

  billableRequestSummaryByCompanyList: BillableRequestSummaryByCompany[] = [];

  showDailySummay = true;
  showMonthlySummay = false;
  showYearlySummay = false;

  todayDate = "";
  thisMonth = "";
  thisYear = "";

  @ViewChild('pie', { static: false }) readonly pie: G2PieComponent | undefined;
  salesPieData: G2PieData[] = [];

  
  @ViewChild('dailyWebAPIEndpointPie', { static: false }) readonly dailyWebAPIEndpointPie: G2PieComponent | undefined;
  @ViewChild('dailyTransactionPie', { static: false }) readonly dailyTransactionPie: G2PieComponent | undefined;
  @ViewChild('dailyCostPie', { static: false }) readonly dailyCostPie: G2PieComponent | undefined;

  dailySummayLoading = false;
  dailyWebAPIEndpointPieData: G2PieData[] = [];
  dailyWebAPIEndpointTotal = ""; 
  dailyTransactionPieData: G2PieData[] = [];
  dailyTransactionTotal = ""; 
  dailyCostData: G2PieData[] = [];
  dailyCostTotal = ""; 

  
  monthlySummayLoading = false;
  monthlyWebAPIEndpointPieData: G2PieData[] = [];
  monthlyWebAPIEndpointTotal = ""; 
  monthlyTransactionPieData: G2PieData[] = [];
  monthlyTransactionTotal = ""; 
  monthlyCostData: G2PieData[] = [];
  monthlyCostTotal = ""; 

  
  yearlySummayLoading = false;
  yearlyWebAPIEndpointPieData: G2PieData[] = [];
  yearlyWebAPIEndpointTotal = ""; 
  yearlyTransactionPieData: G2PieData[] = [];
  yearlyTransactionTotal = ""; 
  yearlyCostData: G2PieData[] = [];
  yearlyCostTotal = ""; 

  total = '';
  
  constructor(private http: _HttpClient, 
    private cdr: ChangeDetectorRef, 
    private obSrv: OnboardingService,
     private platform: Platform, 
     private billableRequestService: BillableRequestService,
     private msg: NzMessageService, 
     private companyService: CompanyService) {
    // TODO: Wait for the page to load
    setTimeout(() => this.genOnboarding(), 1000);
 
    this.loadData();
  }

  loadData() {

    if (this.showDailySummay) {
      this.loadDailyData();
    }
    if (this.showMonthlySummay) {
      this.loadMonthDailyData();
    }
    if (this.showYearlySummay) {
      this.loadYearlyDailyData();
    }

  }

  loadDailyData() {
    this.dailySummayLoading = true;
    let date = new Date();
    // eslint-disable-next-line prefer-template
    this.todayDate = `${date.getFullYear().toString()}-${date.getMonth().toString()}-${date.getDate().toString()}`;
    console.log(`today date: ${this.todayDate}`);
    this.dailyWebAPIEndpointPieData = [];
    this.dailyTransactionPieData = [];
    this.dailyCostData = [];
    this.dailyWebAPIEndpointTotal = ""; 
    this.dailyTransactionTotal = ""; 
    this.dailyCostTotal = ""; 
    
    this.billableRequestService.getBillableRequestSummaryByCompany(undefined, undefined, date)
        .subscribe({
          next: (billableRequestSummaryByCompanyRes) => {

             billableRequestSummaryByCompanyRes.forEach(
              billableRequestSummaryByCompany => {
                this.dailyWebAPIEndpointPieData = [...this.dailyWebAPIEndpointPieData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.totalWebAPIEndpointCall
                  }
                  
                ];
                
                this.dailyTransactionPieData = [...this.dailyTransactionPieData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.totalTransaction
                  }
                  
                ]; 
                
                this.dailyCostData = [...this.dailyCostData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.overallCost
                  }
                  
                ]; 
              }
             );
             
             this.dailyWebAPIEndpointTotal =  this.dailyWebAPIEndpointPieData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
             this.dailyTransactionTotal =  this.dailyTransactionPieData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
             this.dailyCostTotal =  this.dailyCostData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
 
             this.dailySummayLoading = false;
             
          }, 
          error: () => this.dailySummayLoading = false
        })
  }
  
  loadMonthDailyData() {
    this.monthlySummayLoading = true;
    let date = this.getFirstDateOfMonth();
    this.thisMonth = `${date.getFullYear().toString()  }-${  date.getMonth().toString()}`;
    console.log(`first day of month: ${date}`);

    this.monthlyWebAPIEndpointPieData = [];
    this.monthlyTransactionPieData = [];
    this.monthlyCostData = [];
    this.monthlyWebAPIEndpointTotal = ""; 
    this.monthlyTransactionTotal = ""; 
    this.monthlyCostTotal = ""; 
    
    this.billableRequestService.getBillableRequestSummaryByCompany(date, undefined, undefined)
        .subscribe({
          next: (billableRequestSummaryByCompanyRes) => {

             billableRequestSummaryByCompanyRes.forEach(
              billableRequestSummaryByCompany => {
                this.monthlyWebAPIEndpointPieData = [...this.monthlyWebAPIEndpointPieData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.totalWebAPIEndpointCall
                  }
                  
                ];
                
                this.monthlyTransactionPieData = [...this.monthlyTransactionPieData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.totalTransaction
                  }
                  
                ]; 
                
                this.monthlyCostData = [...this.monthlyCostData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.overallCost
                  }
                  
                ]; 
              }
             );
             
             this.monthlyWebAPIEndpointTotal =  this.monthlyWebAPIEndpointPieData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
             this.monthlyTransactionTotal =  this.monthlyTransactionPieData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
             this.monthlyCostTotal =  this.monthlyCostData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
 
             this.monthlySummayLoading = false;
             
                    
          }, 
          error: () => this.monthlySummayLoading = false
        })
  }
  
  loadYearlyDailyData() {
    this.yearlySummayLoading = true;
    let date = this.getFirstDateOfYear();
    this.thisYear = `${date.getFullYear().toString()}`;

    this.yearlyWebAPIEndpointPieData = [];
    this.yearlyTransactionPieData = [];
    this.yearlyCostData = [];
    this.yearlyWebAPIEndpointTotal = ""; 
    this.yearlyTransactionTotal = ""; 
    this.yearlyCostTotal = ""; 
    
    this.billableRequestService.getBillableRequestSummaryByCompany(date, undefined, undefined)
        .subscribe({
          next: (billableRequestSummaryByCompanyRes) => {

             billableRequestSummaryByCompanyRes.forEach(
              billableRequestSummaryByCompany => {
                this.yearlyWebAPIEndpointPieData = [...this.yearlyWebAPIEndpointPieData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.totalWebAPIEndpointCall
                  }
                  
                ];
                
                this.yearlyTransactionPieData = [...this.yearlyTransactionPieData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.totalTransaction
                  }
                  
                ]; 
                
                this.yearlyCostData = [...this.yearlyCostData, 
                  {

                    x: billableRequestSummaryByCompany.serviceName,
                    y: billableRequestSummaryByCompany.overallCost
                  }
                  
                ]; 
              }
             );
             
             this.yearlyWebAPIEndpointTotal =  this.yearlyWebAPIEndpointPieData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
             this.yearlyTransactionTotal =  this.yearlyTransactionPieData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
             this.yearlyCostTotal =  this.yearlyCostData.reduce((pre, now) => now.y + pre, 0).toFixed(2);
 
             this.yearlySummayLoading = false;
             
                    
          }, 
          error: () => this.yearlySummayLoading = false
        })
    
  }

  getFirstDateOfMonth() : Date{
    var date = new Date();
    var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDayOfMonth;
  }

  
  getFirstDateOfYear() : Date{
    var date = new Date();
    var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    return firstDayOfYear;

  }
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    
  }

  private genOnboarding(): void {
    const KEY = 'on-boarding';
    if (!this.platform.isBrowser || localStorage.getItem(KEY) === '1') {
      return;
    }
    this.http.get(`./resource/assets/tmp/on-boarding.json`).subscribe((res) => {
      this.obSrv.start(res);
      localStorage.setItem(KEY, '1');
    });
  }
 

  handleClick(data: G2PieClickItem): void {
    this.msg.info(`${data.item.x} - ${data.item.y}`);

    
  }

  showDailySummayChanged() {

    if (this.showDailySummay) {
      this.loadDailyData();
    }
  }

  
  showMonthlySummayChanged() {
    
    if (this.showMonthlySummay) {
      this.loadMonthDailyData();
    }
  }

  
  showYearlySummayChanged() {
    
    if (this.showYearlySummay) {
      this.loadYearlyDailyData();
    }
  }
}
