import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FileUploadOperationService } from '../services/file-upload-operation.service';
import { FileUploadType } from '../models/file-upload-type';
import { I18NService } from '@core';
import { TitleService } from '@delon/theme';

@Component({
  selector: 'app-util-file-upload',
  templateUrl: './file-upload.component.html',
})
export class UtilFileUploadComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private fileUploadOperationService: FileUploadOperationService,
    private fb: FormBuilder,
    private webLocation: Location,
    private i18n: I18NService,
    private titleService: TitleService,
  ) {}

  loadFileForm: FormGroup;
  fromMenu: boolean;
  pageTitle: string;
  fileUploadUrl: string;
  fileUploadDisabled: boolean;

  allowedFileTypes: Array<{ label: string; value: string }> = [];

  ngOnInit() {
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
          .forEach(fileUploadType => (this.fileUploadUrl = fileUploadType.destinationUrl));
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
}
