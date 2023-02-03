import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { FileUploadType } from '../models/file-upload-type';
import { FileUploadOperationService } from '../services/file-upload-operation.service';

@Component({
  selector: 'app-util-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.less'],
})
export class UtilFileUploadComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private fileUploadOperationService: FileUploadOperationService,
    private fb: FormBuilder,
    private webLocation: Location,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private msg: NzMessageService,
  ) {}
  
  fileTypes = ['.csv'];

  loadFileForm!: FormGroup;
  fromMenu = false;
  pageTitle = '';
  selectedFileUploadType?: FileUploadType;
  fileUploadDisabled = false;

  removeExistingInventory = true;

  allowedFileTypes: Array<{ label: string; value: string }> = [];

  ngOnInit(): void {
    this.loadFileForm = this.fb.group({
      fileTypeSelector: [null],
    });

    this.fileUploadDisabled = true; 

    this.fileUploadOperationService.getFileUploadTypes().subscribe((fileUploadTypes: FileUploadType[]) => {
      fileUploadTypes.forEach(fileUploadType =>
        this.allowedFileTypes.push({ label: fileUploadType.description, value: fileUploadType.name }),
      );

      this.activatedRoute.queryParams.subscribe(params => {
        if (this.activatedRoute.snapshot.params.filetype) {
          this.loadFileForm.get('fileTypeSelector')!.setValue(this.activatedRoute.snapshot.params.filetype);
          this.fromMenu = false;
          this.pageTitle = this.i18n.fanyi('menu.main.util.file-upload');
          this.titleService.setTitle(this.i18n.fanyi('menu.main.util.file-upload'));
          this.setupFileUploadUrl();
          this.fileUploadDisabled = false;
        } else {
          this.fromMenu = true;
        }
      });
    });
  }

  setupFileUploadUrl(): void { 
    if (this.loadFileForm.value.fileTypeSelector) {
      this.fileUploadOperationService.getFileUploadTypes().subscribe((fileUploadTypes: FileUploadType[]) => {
        fileUploadTypes
          .filter(item => item.name === this.loadFileForm.value.fileTypeSelector)
          .forEach(fileUploadType => {
            
            
            this.selectedFileUploadType = fileUploadType;
          });
      });
    }
  }

  back(): void {
    this.webLocation.back();
  }
  selectedFileTypeChanged(fileType: string): void {
    this.setupFileUploadUrl();
    this.fileUploadDisabled = false;
  }

  handleChange(info: NzUploadChangeParam): void {
    console.log('START TO HANDLE CHANGE');
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      this.msg.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      this.msg.error(`${info.file.name} file upload failed.`);
    }
  }
}
