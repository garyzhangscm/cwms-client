import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { RF } from '../models/rf';
import { RFAppVersion } from '../models/rf-app-version';
import { RfAppVersionService } from '../services/rf-app-version.service';

@Component({
  selector: 'app-util-rf-app-version',
  templateUrl: './rf-app-version.component.html',
  styleUrls: ['./rf-app-version.component.less']
})
export class UtilRfAppVersionComponent implements OnInit {

  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("rf.app.version-number"),  index: 'versionNumber' , iif: () => this.isChoose('versionNumber') }, 
    {
      title: this.i18n.fanyi("file-name"),
      renderTitle: 'apkFileColumnTitle' ,
      render: 'apkFileColumn',
      iif: () => this.isChoose('fileName') 
    },
    { title: this.i18n.fanyi("rf.app.is-latest-version"),  index: 'latestVersion' , iif: () => this.isChoose('latestVersion') }, 
    {
      title: this.i18n.fanyi("rf.app.release-note"),
      renderTitle: 'releaseNoteColumnTitle' ,
      render: 'releaseNoteColumn',
      iif: () => this.isChoose('releaseNote') 
    },    
    {
      title: this.i18n.fanyi("rf.app.release-date"),
      renderTitle: 'releaseDateColumnTitle' ,
      render: 'releaseDateColumn',
      iif: () => this.isChoose('releaseDate') 
    },  
    {
      title: this.i18n.fanyi("action"),  
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 110, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },  
    
  ]; 
  customColumns = [

    { label: this.i18n.fanyi("rf.app.version-number"), value: 'versionNumber', checked: true },
    { label: this.i18n.fanyi("file-name"), value: 'fileName', checked: true },
    { label: this.i18n.fanyi("rf.app.is-latest-version"), value: 'latestVersion', checked: true },
    { label: this.i18n.fanyi("rf.app.release-note"), value: 'releaseNote', checked: true },
    { label: this.i18n.fanyi("rf.app.release-date"), value: 'releaseDate', checked: true },
    

  ];

  
  searchForm!: UntypedFormGroup;
  rfAppVersions: RFAppVersion[] = [];
  searchResult = "";
   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private rfAppVersionService: RfAppVersionService,
    private messageService: NzMessageService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/util/rf-app-version").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                        
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.rf-app-version'));
    // initiate the search form
    this.searchForm = this.fb.group({
      versionNumber: [null],
      isLatestVersion: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.versionNumber) {
        this.searchForm.controls.versionNumber.setValue(params.versionNumber);
        this.search();
      }
    });}

    
  resetForm(): void {
    this.searchForm.reset();
    this.rfAppVersions = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.rfAppVersionService
      .getRFAppVersions(this.searchForm.value.isLatestVersion,
        this.searchForm.value.versionNumber )
      .subscribe({

        next: (rfAppVersionRes) => {
          this.rfAppVersions = rfAppVersionRes;
          this.setupAPKDownloadUrl(this.rfAppVersions);
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: rfAppVersionRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
  
  setupAPKDownloadUrl(rfAppVersions: RFAppVersion[]) {
    rfAppVersions.forEach(
      rfAppVersion => {
        rfAppVersion.apkDownloadUrl = `${environment.api.baseUrl}resource/rf-apk-files/${rfAppVersion.id!}`;
      }
    )
  }
 
  removeRFAppVersion(rfAppVersion: RFAppVersion) : void{
    this.isSpinning = true; 
    this.rfAppVersionService.removeRFAppVersion(rfAppVersion).subscribe({

      next: () => { 
        this.isSpinning = false; 
        this.messageService.success(this.i18n.fanyi('message.remove.success'));
        this.search();

      },
      error: () => {
        this.isSpinning = false; 
      }
    });
    
  }

  
  isChoose(key: string): boolean {
      return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
        this.st!.resetColumns({ emitReload: true });

    }
  }

}
