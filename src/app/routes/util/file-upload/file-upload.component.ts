import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FileUploadOperationService } from '../services/file-upload-operation.service';
import { FileUploadType } from '../models/file-upload-type';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UploadChangeParam } from 'ng-zorro-antd/upload';

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
    private i18n: I18NService,
    private titleService: TitleService,
    private msg: NzMessageService,
  ) {}
  // Following 2 fields are used for
  // downloading the template
  data = {
    otherdata: 1,
    time: new Date(),
  };
  fileTypes = ['.csv'];

  loadFileForm: FormGroup;
  fromMenu: boolean;
  pageTitle: string;
  selectedFileUploadType: FileUploadType;
  fileUploadDisabled: boolean;

  allowedFileTypes: Array<{ label: string; value: string }> = [];

  ngOnInit() {
    this.loadFileForm = this.fb.group({
      fileTypeSelector: [null],
    });

    this.fileUploadDisabled = true;
    this.selectedFileUploadType = null;

    this.fileUploadOperationService.getFileUploadTypes().subscribe((fileUploadTypes: FileUploadType[]) => {
      fileUploadTypes.forEach(fileUploadType =>
        this.allowedFileTypes.push({ label: fileUploadType.description, value: fileUploadType.name }),
      );

      this.activatedRoute.queryParams.subscribe(params => {
        if (this.activatedRoute.snapshot.params.filetype) {
          this.loadFileForm.get('fileTypeSelector').setValue(this.activatedRoute.snapshot.params.filetype);
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

  setupFileUploadUrl() {
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

  back() {
    this.webLocation.back();
  }
  selectedFileTypeChanged(fileType: string) {
    this.setupFileUploadUrl();
    this.fileUploadDisabled = false;
  }

  handleChange(info: UploadChangeParam): void {
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
