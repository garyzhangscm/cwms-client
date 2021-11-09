import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WorkOrderQcSample } from '../../work-order/models/work-order-qc-sample';
import { RFAppVersion } from '../models/rf-app-version';
import { RfAppVersionService } from '../services/rf-app-version.service';

@Component({
  selector: 'app-util-rf-app-version-maintenance',
  templateUrl: './rf-app-version-maintenance.component.html',
})
export class UtilRfAppVersionMaintenanceComponent implements OnInit {

  currentRFAppVersion: RFAppVersion; 
  stepIndex = 0; 
  versionNumberValidateStatus = 'warning'; 
  isSpinning = false; 
  pageTitle: string;

  apkFileUploadUrl = '';
  fileList: NzUploadFile[] = [];
  acceptUploadedFileTypes = '.apk';  

  constructor(private http: _HttpClient, 
    private rfAppVersionService: RfAppVersionService, 
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private titleService: TitleService,
    private companyService: CompanyService, 
    private messageService: NzMessageService,
    private router: Router,) { 
      this.currentRFAppVersion = {        
        versionNumber: "",
        fileName: "",
        latestVersion: true,
        companyId: this.companyService.getCurrentCompany()!.id,
        releaseNote: "",
        releaseDate: new Date(),
        
      }
      this.pageTitle = this.i18n.fanyi('menu.main.util.rf-app-version');
    }

  ngOnInit(): void { 
    
    this.fileList = []; 
    this.apkFileUploadUrl = `resource/rf-app-version/new/apk-files?companyId=${this.companyService.getCurrentCompany()!.id}`;

  }
   
 
  versionNumberChange(event: Event) {  
    this.currentRFAppVersion!.versionNumber = (event.target as HTMLInputElement).value;
    if (this.currentRFAppVersion!.versionNumber) {
      // THE USER input the version number, let's make sure it is not exists yet
      this.rfAppVersionService.getRFAppVersions(undefined, this.currentRFAppVersion!.versionNumber).subscribe({
        next: (rfAppVersionRes) => {
          if (rfAppVersionRes.length > 0) {
            // the order is already exists 
            this.versionNumberValidateStatus = 'numberExists'
          }
        }
      })
      this.versionNumberValidateStatus = 'success'
    }
    else {
      this.versionNumberValidateStatus = 'required'
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
      console.log(`this.sampleNumberValidateStatus: ${this.versionNumberValidateStatus}`)
      return this.versionNumberValidateStatus === 'success';
    }

    return true;
  } 
  
  confirm() { 
    this.isSpinning = true;  
    
    this.rfAppVersionService.addRFAppVersion(this.currentRFAppVersion).subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/util/rf-app-version?versionNumber=${this.currentRFAppVersion?.versionNumber}`);
        }, 2500);
      },
      error: () => {
        this.isSpinning = false;
      },
    }); 
  }
  
  loadImageUrls(workOrderQcSample: WorkOrderQcSample) {
    workOrderQcSample.imageUrls = this.fileList.map(file => file.name).join(",");
  }

  getFileUrl(apkFileName: string) : string {
    return `${environment.api.baseUrl}resource/rf-app-version/new/apk-files/${this.companyService.getCurrentCompany()!.id}/${apkFileName}`;

    
  }
   
  handleUploadChange(info: NzUploadChangeParam): void { 
    console.log(`handleUploadChange: ${JSON.stringify(info)}`)
    if (info.file.status === 'done') {
      
      let url = this.getFileUrl(info.file.name);
      
      // note, we will only allow one APK file per version
      this.fileList = [ 
        {
          uid: info.file.uid,
          name: info.file.name,
          status: info.file.status,
          response: '', // custom error message to show
          url: url
        }
      ]; 
      this.currentRFAppVersion.fileName = info.file.name

    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
      this.fileList = this.fileList.filter(file => file.uid !== info.file.uid);
    }
    else if (info.file.status === 'removed') {
      this.fileList = []; 
      this.currentRFAppVersion.fileName = "";


    }
    
  }


}
