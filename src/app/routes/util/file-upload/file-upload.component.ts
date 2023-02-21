import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
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
    private fb: UntypedFormBuilder,
    private webLocation: Location,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private msg: NzMessageService,
    private warehouseService: WarehouseService
  ) {}
  
  fileTypes = ['.csv'];

  loadFileForm!: UntypedFormGroup;
  fromMenu = false;
  pageTitle = '';
  selectedFileUploadType?: FileUploadType;
  selectedFileUploadUrl = '';
  fileUploadDisabled = false;
  isSpinning = false;

  // when we upload a bulky files, we will need to 
  // use the key so we can track the progress.
  fileUploadProgressKey = '';
  fileUploadProgress = 100;
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
            this.selectedFileUploadUrl = `${this.selectedFileUploadType.destinationUrl}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
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
    if (info.file.status === 'uploading') {
      // this.isSpinning = true;
      
      if (this.selectedFileUploadType?.name == 'inventory') { 
          this.fileUploadProgress = 0;
      }
      else {
        this.isSpinning = true;
      }
      console.log(info.file, info.fileList);
    }
    else if (info.file.status === 'done') { 
      this.checkFileUploadProgress(info);
      
    } else if (info.file.status === 'error') {
      this.isSpinning = false;
      this.fileUploadProgress = 100;
      this.msg.error(`${info.file.name} file upload failed.`);
    }
  } 

  checkFileUploadProgress(info: NzUploadChangeParam) {

    if (this.selectedFileUploadType?.name == 'inventory') { 
      
      // this.isSpinning = true;
      setTimeout(() => {  
        this.fileUploadOperationService.getInventoryFileUploadProgress(info.file.response.data).subscribe({
          next: (progress) => {
            this.fileUploadProgress = progress;
            if (progress >= 100) {
              // this.isSpinning = false;
              this.msg.success(`${info.file.name} file uploaded successfully`);

            }
            else {
              // OK, we are not done yet, let's call the same command again
              console.log(`${info.file.name} upload progress: ${progress}`);
              this.checkFileUploadProgress(info);
            }
          }, 
          error: () =>  this.fileUploadProgress = 100
          //this.isSpinning = false
        })
      }, 1000);
    }
    else {
      
      this.fileUploadProgress = 100;
      this.isSpinning = false;
      this.msg.success(`${info.file.name} file uploaded successfully`);
    }
  }

  handleCancel() {
    return false;
  }
  handleOk() {
    return false;
  }
}
