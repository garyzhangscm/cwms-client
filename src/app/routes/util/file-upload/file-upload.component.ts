import { Location } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { FileUploadResult } from '../models/file-upload-result';
import { FileUploadType } from '../models/file-upload-type';
import { FileUploadOperationService } from '../services/file-upload-operation.service';

@Component({
  selector: 'app-util-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.less'],
})
export class UtilFileUploadComponent implements OnInit {

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    { title: this.i18n.fanyi("lineNumber"), index:"lineNumber" },  
    { title: this.i18n.fanyi("record"), index:"record" },  
    { title: this.i18n.fanyi("result"), index:"result" },  
    { title: this.i18n.fanyi("errorMessage"), index:"errorMessage" },   
  ]; 
  
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
  showResultModal = false;

  // when we upload a bulky files, we will need to 
  // use the key so we can track the progress.
  fileUploadProgressKey = '';
  fileUploadProgress = 100; 
  fileUploadResults: FileUploadResult[] = [];

  removeExistingInventory = false;

  allowedFileTypes: Array<{ label: string; value: string }> = [];

  ngOnInit(): void {
    this.loadFileForm = this.fb.group({
      fileTypeSelector: [null], 
    });

    this.fileUploadDisabled = true; 
    this.showResultModal = false;

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
            this.selectedFileUploadUrl = `${this.selectedFileUploadType.destinationUrl}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&removeExistingInventory=${this.removeExistingInventory}`;
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
      
      if (this.selectedFileUploadType?.name == 'inventory' || 
        this.selectedFileUploadType?.name == 'receiving-inventories'  || 
        this.selectedFileUploadType?.name == 'putaway' ) { 
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

    if (this.selectedFileUploadType?.trackingProgressUrl != null &&
      this.selectedFileUploadType?.trackingProgressUrl.length > 0) { 
      
      // this.isSpinning = true;
      setTimeout(() => {  
        this.fileUploadOperationService.getFileUploadProgress(this.selectedFileUploadType?.trackingProgressUrl!, info.file.response.data).subscribe({
          next: (progress) => {
            this.fileUploadProgress = progress;
            if (progress >= 100) {
              // this.isSpinning = false;
              this.msg.success(`${info.file.name} file uploaded successfully`);

              this.showResult(info.file.response.data);
            }
            else {
              // OK, we are not done yet, let's call the same command again
              console.log(`${info.file.name} upload progress: ${progress}`);
              this.checkFileUploadProgress(info);
            }
          }, 
          error: () =>  {
            this.fileUploadProgress = 100;
            
            this.showResult(info.file.response.data);
          }
          //this.isSpinning = false
        })
      }, 1000);
    }
    else {
      
      this.fileUploadProgress = 100;
      this.showResult(info.file.response.data);
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

  showResult(key: string) {
    console.log(`check if we will need to show the result`);
    console.log(`this.selectedFileUploadType?.resultUrl: ${this.selectedFileUploadType?.resultUrl}`);

    if (this.selectedFileUploadType?.resultUrl && this.selectedFileUploadType?.resultUrl.length > 0) {
      // the file upload type provide an end point to show the result, let's display the result to the user
      this.showResultModal = true;
      this.fileUploadResults = [];
      this.fileUploadOperationService.getFileUploadResult(
        this.selectedFileUploadType?.resultUrl!, key).subscribe({
       
          next: (fileUploadResultRes) => this.fileUploadResults = fileUploadResultRes

      });
    }
    else {
      
       this.showResultModal = false;
    }
  }
  
  closeResultModal() {
    console.log(`close the result modal`)
    this.showResultModal = false;

  }

  removeExistingInventoryChanged() {
    console.log(`removeExistingInventory is changed to ${this.removeExistingInventory}`)
    if (this.selectedFileUploadType) {
      this.selectedFileUploadUrl = `${this.selectedFileUploadType.destinationUrl}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&removeExistingInventory=${this.removeExistingInventory}`;
    }
    
  }
}
