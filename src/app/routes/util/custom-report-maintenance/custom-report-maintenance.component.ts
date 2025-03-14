import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { CustomReport } from '../models/custom-report';
import { CustomReportService } from '../services/custom-report.service';

@Component({
    selector: 'app-util-custom-report-maintenance',
    templateUrl: './custom-report-maintenance.component.html',
    standalone: false
})
export class UtilCustomReportMaintenanceComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentCustomReport: CustomReport; 
  stepIndex = 0; 
  nameValidateStatus = 'warning'; 
  nameErrorCode = ''; 
  isSpinning = false;  
  newCustomReport = true;
  pageTitle: string;
 
  newParameterName = "";
  newParameterDisplayText = "";
  newParameterValueRequired = false;
  newParameterDefaultValue = "";

  addParameterModalVisible = false;
 

  constructor(private http: _HttpClient, 
    private customReportService: CustomReportService, 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private companyService: CompanyService, 
    private warehouseService: WarehouseService,  
    private router: Router,) { 
 

      this.currentCustomReport = {        
        companyId: companyService.getCurrentCompany()!.id,
        warehouseId: warehouseService.getCurrentWarehouse().id,
    
        name: "",
        
        runAtCompanyLevel: false,
     
        query: "",
    
        customReportParameters: []
        
      }
      this.pageTitle = this.i18n.fanyi('customReport');
    }

  ngOnInit(): void {  
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) { 
        this.customReportService.getCustomReport(params['id'])
          .subscribe(customReportRes => {
            this.currentCustomReport = customReportRes;

            this.newCustomReport = false;
            this.nameValidateStatus = 'success' 
            
          });
      }
      else {
        
        this.newCustomReport = true; 
      }
    });


  }
   
  nameChange(event: Event) {  
    this.currentCustomReport!.name = (event.target as HTMLInputElement).value;
    if (this.currentCustomReport!.name) {
      // THE USER input the version number, let's make sure it is not exists yet
      this.customReportService.getCustomReports(this.currentCustomReport!.name).subscribe({
        next: (customReportRes) => {
          if (customReportRes.length > 0) {
            // the order is already exists 
            this.nameValidateStatus = 'error'; 
            this.nameErrorCode = 'nameExists'
          }
        }
      })
      this.nameValidateStatus = 'success'
    }
    else {
      this.nameValidateStatus = 'required'
    }
  }
  
  previousStep() {
    this.stepIndex--;
  }
  nextStep() {
    if (this.passValidation()) {

      this.stepIndex++;
    }
  }
  passValidation() : boolean {

    if (this.stepIndex === 0) {
      console.log(`this.nameValidateStatus: ${this.nameValidateStatus}`)
      return this.nameValidateStatus === 'success';
    }

    return true;
  } 
  
  confirm() { 
    this.isSpinning = true;  
    if (this.newCustomReport) {

      this.customReportService.addCustomReport(this.currentCustomReport).subscribe({
        next: () => {
  
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/util/custom-report?name=${this.currentCustomReport?.name}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 

    }
    else {
      this.customReportService.changeCustomReport(this.currentCustomReport).subscribe({
        next: () => {
  
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/util/custom-report?name=${this.currentCustomReport?.name}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 

    }
    
  } 

  removeParameter(name: string) {
    this.currentCustomReport.customReportParameters = 
        this.currentCustomReport.customReportParameters.filter(
          parameter => parameter.name != name
        );
  }

  openAddParameterModal() {
    this.newParameterName = "";
    this.newParameterDisplayText = "";
    this.addParameterModalVisible = true;

  }
  onParameterModalCancel() {
    this.newParameterName = "";
    this.newParameterDisplayText = "";
    this.addParameterModalVisible = false;

  }
  onParameterModalConfirm() {
    if (this.newParameterName == "") {
      this.newParameterName = "";
      this.newParameterDisplayText = "";
      this.addParameterModalVisible = false;
      return;
    }
    // make sure there's no duplicated name
    if (this.currentCustomReport.customReportParameters.some(parameter => parameter.name == this.newParameterName)){
      this.newParameterName = "";
      this.newParameterDisplayText = "";
      this.addParameterModalVisible = false;
      return;
    }

    this.currentCustomReport.customReportParameters = [...this.currentCustomReport.customReportParameters, 
        { 
          companyId: this.companyService.getCurrentCompany()!.id,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          name: this.newParameterName, 
          displayText: this.newParameterDisplayText,
          required: this.newParameterValueRequired,
          defaultValue: this.newParameterDefaultValue

        }];
        
    this.newParameterName = "";
    this.newParameterDisplayText = "";
    this.addParameterModalVisible = false; 

  }


  return(): void {
    const returnUrl = `/util/custom-report`;
    if (!this.newCustomReport && this.currentCustomReport.name != null) {

      this.router.navigateByUrl(`${returnUrl}?name=${this.currentCustomReport.name}`);
    }
    else {
      
      this.router.navigateByUrl(`${returnUrl}`);
    }
  }

}
