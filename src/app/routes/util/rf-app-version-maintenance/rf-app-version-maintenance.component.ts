
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WorkOrderQcSample } from '../../work-order/models/work-order-qc-sample';
import { RF } from '../models/rf';
import { RFAppVersion } from '../models/rf-app-version';
import { RfAppVersionService } from '../services/rf-app-version.service';
import { RfService } from '../services/rf.service';

@Component({
    selector: 'app-util-rf-app-version-maintenance',
    templateUrl: './rf-app-version-maintenance.component.html', styles: [
        ` 
      .demo-infinite-container {
        height: 300px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
      }

      nz-list {
        padding: 24px;
      } 
 
    `
    ],
    standalone: false
})
export class UtilRfAppVersionMaintenanceComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentRFAppVersion: RFAppVersion; 
  stepIndex = 0; 
  versionNumberValidateStatus = 'warning'; 
  versionNumberErrorCode = ''; 
  isSpinning = false; 
  newRFAppVersion = true;
  pageTitle: string;

  apkFileUploadUrl = '';
  fileList: NzUploadFile[] = [];
  acceptUploadedFileTypes = '.apk';  

  
  rfList: TransferItem[] = [];
  unassignedRFText: string;
  assignedRFText: string;
  allRFs: RF[] = [];

  constructor(private http: _HttpClient, 
    private rfAppVersionService: RfAppVersionService, 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private companyService: CompanyService, 
    private messageService: NzMessageService,
    private rfService: RfService,
    private router: Router,) { 

      this.unassignedRFText = this.i18n.fanyi('RF.unassigned');
      this.assignedRFText = this.i18n.fanyi('RF.assigned');

      this.currentRFAppVersion = {        
        versionNumber: "",
        fileName: "",
        latestVersion: true,
        companyId: this.companyService.getCurrentCompany()!.id,
        releaseNote: "",
        releaseDate: new Date(),
        rfAppVersionByRFCodes: []
        
      }
      this.pageTitle = this.i18n.fanyi('menu.main.util.rf-app-version');
    }

  ngOnInit(): void { 
    
    this.fileList = []; 
    this.apkFileUploadUrl = `resource/rf-app-version/new/apk-files?companyId=${this.companyService.getCurrentCompany()!.id}`;

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) { 
        this.rfAppVersionService.getRFAppVersion(params['id'])
          .subscribe(rfAppVersion => {
            this.currentRFAppVersion = rfAppVersion;

            this.newRFAppVersion = false;
            this.versionNumberValidateStatus = 'success'
            this.initRFAssignment();
            this.loadAPKFile();
            
          });
      }
      else {
        
        this.newRFAppVersion = true;
        this.initRFAssignment();
      }
    });


  }
  
  loadAPKFile() {
    if(!this.currentRFAppVersion.id) {
      
      this.fileList = []; 
    }
    else {
        this.currentRFAppVersion.apkDownloadUrl = `${environment.api.baseUrl}resource/rf-apk-files/${this.currentRFAppVersion.id!}`;
        this.fileList = [
          {
            uid: this.currentRFAppVersion.fileName,
            name: this.currentRFAppVersion.fileName,
            status: 'done',
            response: '', // custom error message to show
            url: this.currentRFAppVersion.apkDownloadUrl
          }
        ];
    }
  }
   
  versionNumberChange(event: Event) {  
    this.currentRFAppVersion!.versionNumber = (event.target as HTMLInputElement).value;
    if (this.currentRFAppVersion!.versionNumber) {
      // THE USER input the version number, let's make sure it is not exists yet
      this.rfAppVersionService.getRFAppVersions(undefined, this.currentRFAppVersion!.versionNumber).subscribe({
        next: (rfAppVersionRes) => {
          if (rfAppVersionRes.length > 0) {
            // the order is already exists 
            this.versionNumberValidateStatus = 'error'; 
            this.versionNumberErrorCode = 'numberExists'
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
    if (this.newRFAppVersion) {

      this.rfAppVersionService.addRFAppVersion(this.currentRFAppVersion).subscribe({
        next: () => {
  
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/util/rf-app-version?versionNumber=${this.currentRFAppVersion?.versionNumber}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 

    }
    else {
      this.rfAppVersionService.changeRFAppVersion(this.currentRFAppVersion).subscribe({
        next: () => {
  
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/util/rf-app-version?versionNumber=${this.currentRFAppVersion?.versionNumber}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 

    }
    
  }
  
  loadImageUrls(workOrderQcSample: WorkOrderQcSample) {
    workOrderQcSample.imageUrls = this.fileList.map(file => file.name).join(",");
  }

  getFileUrl(apkFileName: string) : string {
    return `${environment.api.baseUrl}resource/rf-app-version/new/apk-files/${this.companyService.getCurrentCompany()!.id}/${apkFileName}`;

    
  }
   
  handleUploadChange(info: NzUploadChangeParam): void { 
    
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


  transferListFilterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }
  
  transferListSearch(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  transferListSelect(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  transferListChange(ret: {}): void {
    console.log('nzChange', ret);

    // get all the assigned RF to this version
    const currentAssignedRFIds = [...this.rfList.filter(item => item.direction === 'right').map(item => item['key'])]; 
    console.log(`currentAssignedRFIds:${currentAssignedRFIds}`);
    this.currentRFAppVersion.rfAppVersionByRFCodes = [];
    this.allRFs.filter(
      rf => currentAssignedRFIds.some(assignedRFId => 
                 +assignedRFId === rf.id))
    .forEach(rf => {
      console.log(`add rf ${rf.rfCode}`)
      this.currentRFAppVersion.rfAppVersionByRFCodes = [
        ...this.currentRFAppVersion.rfAppVersionByRFCodes, 
        {
          rf: rf,
        }
      ]
    })
  }
  
  
  initRFAssignment(): void {
    
    this.rfList = [];
    this.rfService.getRFs().subscribe(rfRes => {
      this.allRFs = rfRes;
      this.allRFs.forEach(
        rf => {

          this.rfList.push({
            key: rf.id!.toString(),
            title: `${rf.rfCode}`,
            description: `${rf.rfCode}`,
            direction: this.currentRFAppVersion.rfAppVersionByRFCodes
                        .some(rfAppVersionByRFCode => 
                              rfAppVersionByRFCode.rf.id === rf.id) ? 'right' : undefined,
          });
        }
      )
      
      
    });
  }
 

}
