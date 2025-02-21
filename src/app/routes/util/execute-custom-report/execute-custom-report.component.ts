import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CustomReport } from '../models/custom-report';
import { CustomReportExecutionHistory } from '../models/custom-report-execution-history';
import { CustomReportExecutionStatus } from '../models/custom-report-execution-status';
import { CustomReportExecutionHistoryService } from '../services/custom-report-execution-history.service';
import { CustomReportService } from '../services/custom-report.service';

@Component({
    selector: 'app-util-execute-custom-report',
    templateUrl: './execute-custom-report.component.html',
    standalone: false
})
export class UtilExecuteCustomReportComponent implements OnInit {
[x: string]: any;

  currentCustomReport?: CustomReport;  
  customReportExecutionHistories: CustomReportExecutionHistory[] = [];
  customReportExecutionStatusUpdateTimer?: NodeJS.Timeout;

  CustomReportExecutionStatusList = CustomReportExecutionStatus;

  isSpinning = false;   
  pageTitle = "";
  customReportParametersTableColumns : STColumn[] = [
     
    { title: this.i18n.fanyi("displayText"),  index: 'displayText' , }, 
    { title: this.i18n.fanyi("value"),  
         render: 'valueColumn', }, 
  ]; 
  
  
  constructor(private http: _HttpClient, 
    private customReportService: CustomReportService, 
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private titleService: TitleService,
    private messageService: NzMessageService,
    private companyService: CompanyService, 
    private warehouseService: WarehouseService,  
    private customReportExecutionHistoryService: CustomReportExecutionHistoryService,
    private router: Router,) { 
 
      this.pageTitle = this.i18n.fanyi('customReport');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) { 
        this.customReportService.getCustomReport(params.id)
          .subscribe(customReportRes => {
            this.currentCustomReport = customReportRes; 
            
          });
      }
    });

    this.customReportExecutionHistories = [];

    
    // get status of the report execution every 5 second = 5 * 1000 = 5,000 ms
    this.customReportExecutionStatusUpdateTimer = 
        setInterval(() => {
      
          this.refreshCustomReportExecutionStatus();
        }, 5000); 

  }
  
  ngOnDestroy() {
    console.log(`custom report on destroy, we will remove the timer that will refresh the status of the custom report execution`);

    if (this.customReportExecutionStatusUpdateTimer != null) {
      clearInterval(this.customReportExecutionStatusUpdateTimer);
    }
  }

  return(): void {
    const returnUrl = `/util/custom-report`;
    if (this.currentCustomReport?.name != null) {

      this.router.navigateByUrl(`${returnUrl}?name=${this.currentCustomReport.name}`);
    }
    else {
      
      this.router.navigateByUrl(`${returnUrl}`);
    }

  }

  refreshCustomReportExecutionStatus() {

    const customReportExecutionHistoryIDs = this.customReportExecutionHistories.filter(
      // we don't need to update any execution history that is already expired, or already fulfilled
      customReportExecutionHistory => customReportExecutionHistory.resultFileExpired == false &&
          customReportExecutionHistory.customReportExecutionPercent < 100
    ).map(
      customReportExecutionHistory => customReportExecutionHistory.id
    ).join(",");

    if (customReportExecutionHistoryIDs == null) {
      return;
    }

    this.customReportExecutionHistoryService.getCustomReportExecutionHistories(customReportExecutionHistoryIDs)
    .subscribe({
      next: (customReportExecutionHistoryRes) => {
        customReportExecutionHistoryRes.forEach(
          updatedCustomReportExecutionHistory => {

            const index = this.customReportExecutionHistories.findIndex(
              customReportExecutionHistory => customReportExecutionHistory.id == updatedCustomReportExecutionHistory.id
            );
            if (index >= 0) {
              this.customReportExecutionHistories[index] = updatedCustomReportExecutionHistory;
              if (this.customReportExecutionHistories[index].customReportExecutionPercent >= 100) {
                // build the download url
                
                let url = `${environment.api.baseUrl}resource/customer-report-execution-histories`;

                url = `${url}/download`; 
                url = `${url}/${this.customReportExecutionHistories[index].id}`;
                this.customReportExecutionHistories[index].resultFileDownloadUrl = url;
              }
            }
          }
        )
      }
    });


  }

  executeCustomReport() {
    this.isSpinning = true;
    this.customReportService.runCustomReport(this.currentCustomReport!).subscribe({
      next: (customReportExecutionHistoryRes) => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.customReportExecutionHistories = [...this.customReportExecutionHistories, 
          customReportExecutionHistoryRes]; 
      }
      , 
      error: () => {
        this.isSpinning = false;
      }
      
    })
  }

  customReportParameterValueChanged(name: string, value: string) {
    console.log(`parameter ${name} is chnaged to ${value}`);
    
    this.currentCustomReport?.customReportParameters.filter(
      parameter => parameter.name == name
    ).forEach(
      parameter => parameter.value = value
    );
  }
 
  readyForDownload(customReportExecutionHistory: CustomReportExecutionHistory) {
    return customReportExecutionHistory.customReportExecutionPercent == 100 
        && customReportExecutionHistory.resultFileDownloadUrl != null 
        && customReportExecutionHistory.status == CustomReportExecutionStatus.COMPLETE;
  }
}
