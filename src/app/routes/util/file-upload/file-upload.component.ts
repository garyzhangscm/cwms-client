import { Location } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { FileUploadColumnMapping } from '../models/file-upload-column-mapping';
import { FileUploadResult } from '../models/file-upload-result';
import { FileUploadType } from '../models/file-upload-type';
import { FileUploadColumnMappingService } from '../services/file-upload-column-mapping.service';
import { FileUploadOperationService } from '../services/file-upload-operation.service';

@Component({
    selector: 'app-util-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.less'],
    standalone: false
})
export class UtilFileUploadComponent implements OnInit {

  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [
    
    { title: this.i18n.fanyi("lineNumber"), index:"lineNumber", width: "5%" },  
    { title: this.i18n.fanyi("record"), 
    render: 'recordColumn' , width: "55%"},  
    { title: this.i18n.fanyi("result"), index:"result" , width: "5%"},  
    { title: this.i18n.fanyi("errorMessage"), render: 'errorMessageColumn' , width: "35%"},   
  ]; 

  fileUploadTypeColumnTableEditRowName: string | null = null;
  fileUploadTypeColumnMappings = new Map<string, string>();

  displayOnly = false;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['items', false],
    ['BOMs', false],
    ['inventory', false],
    ['itemUnitOfMeasure', false],
    ['locations', false],
    ['orders', false],
    ['parcel-packages', false],
    ['putaway-inventories', false],
    ['receipts', false],
    ['receiving-inventories', false],
    ['shipping-trailer-appointment', false],
  ]);
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private fileUploadOperationService: FileUploadOperationService,
    private fb: UntypedFormBuilder,
    private webLocation: Location, 
    private titleService: TitleService,
    private msg: NzMessageService,
    private userService: UserService,
    private warehouseService: WarehouseService, 
    private fileUploadColumnMappingService: FileUploadColumnMappingService,
    private companyService: CompanyService, 
  ) {
    userService.isCurrentPageDisplayOnly("/util/file-upload").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                  
    
      
  }
  
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
  displayFileUploadResults: FileUploadResult[] = [];

  removeExistingInventoryWithSameLPN = true;
  emptyLocation = true;
  createCustomer = true;
  modifyCustomer = true;
  ignoreUnknownFields = true;
  resultTotal = 0;
  resultSuccess = 0;
  resultFail = 0;

  // if the user come from other web page(not directly from menu)
  // but the option is not allowed by the role permission
  optionAllowed = true;
  urlFileUploadType = "";

  allowedFileTypes: Array<{ label: string; value: string }> = [];

  ngOnInit(): void {
    this.loadFileForm = this.fb.group({
      fileTypeSelector: [null], 
    });

    this.fileUploadDisabled = true; 
    this.showResultModal = false;
    this.isSpinning = true;
    this.userService.getUserPermissionByWebPage("/util/file-upload").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        ) 

        this.fileUploadOperationService.getFileUploadTypes().subscribe((fileUploadTypes: FileUploadType[]) => { 
          fileUploadTypes.filter(fileUploadType => {
            return this.userPermissionMap.has(fileUploadType.name) && this.userPermissionMap.get(fileUploadType.name) == true
          })
          .forEach(fileUploadType =>
            this.allowedFileTypes.push({ label: fileUploadType.description, value: fileUploadType.name }),
          );
     
     
          this.activatedRoute.queryParams.subscribe(params => { 
            if (this.activatedRoute.snapshot.params['filetype']) {
              // if the file type from the url is not allowed
              // show error message 
              if (!this.userPermissionMap.has(this.activatedRoute.snapshot.params['filetype']) ||
                   this.userPermissionMap.get(this.activatedRoute.snapshot.params['filetype']) == false) {
                this.urlFileUploadType = this.activatedRoute.snapshot.params['filetype'];
                this.optionAllowed = false;
                this.fromMenu = false;
                this.pageTitle = this.i18n.fanyi('menu.main.util.file-upload');
                this.titleService.setTitle(this.i18n.fanyi('menu.main.util.file-upload')); 
                this.fileUploadDisabled = true;
              }
              else {
                this.optionAllowed = true;
                this.loadFileForm.get('fileTypeSelector')!.setValue(this.activatedRoute.snapshot.params['filetype']);
                this.fromMenu = false;
                this.pageTitle = this.i18n.fanyi('menu.main.util.file-upload');
                this.titleService.setTitle(this.i18n.fanyi('menu.main.util.file-upload'));
                this.setupFileUploadUrl();
                this.fileUploadDisabled = false;
                this.loadColumnMapping();

              }
            } else {
              this.fromMenu = true;
              this.optionAllowed = true;
            }
          }); 
           this.isSpinning = false;
        }); 
      }, 
      error: () => {
        this.isSpinning = false;
        this.optionAllowed = false;
      }
    }); 

  }

  setupFileUploadUrl(): void { 
    if (this.loadFileForm.value.fileTypeSelector) {
      this.fileUploadOperationService.getFileUploadTypes().subscribe((fileUploadTypes: FileUploadType[]) => {
        fileUploadTypes
          .filter(item => item.name === this.loadFileForm.value.fileTypeSelector)
          .forEach(fileUploadType => {
                this.selectedFileUploadType = fileUploadType;
                this.refreshFileParameters();
            });
      });
    }
  }

  refreshFileParameters() {
    console.log(`selectedFileUploadType: ${this.selectedFileUploadType?.name}`)
    let url = `${this.selectedFileUploadType!.destinationUrl}`
    url = `${url}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`
    url = `${url}&companyId=${this.companyService.getCurrentCompany()!.id}`
    url = `${url}&ignoreUnknownFields=${this.ignoreUnknownFields}`
    url = `${url}&removeExistingInventoryWithSameLPN=${this.removeExistingInventoryWithSameLPN}`
    url = `${url}&emptyLocation=${this.emptyLocation}`
    url = `${url}&createCustomer=${this.createCustomer}`
    url = `${url}&modifyCustomer=${this.modifyCustomer}`
    this.selectedFileUploadUrl = url;
          
  }

  loadColumnMapping(): void { 
    this.fileUploadTypeColumnMappings.clear();
    if (this.loadFileForm.value.fileTypeSelector) {
      this.fileUploadColumnMappingService.getFileUploadColumnMapping(this.loadFileForm.value.fileTypeSelector).subscribe(
      {
        next: (fileUploadColumnMappingRes) => {
          fileUploadColumnMappingRes.forEach(
            fileUploadColumnMapping => {
              this.fileUploadTypeColumnMappings.set(fileUploadColumnMapping.columnName, fileUploadColumnMapping.mapToColumnName)
            }
          );
        } 
      }); 
    } 
  }

  back(): void {
    this.webLocation.back();
  }
  selectedFileTypeChanged(fileType: string): void {
    this.setupFileUploadUrl();
    this.fileUploadDisabled = false;
    this.loadColumnMapping();
  }

  handleChange(info: NzUploadChangeParam): void {  
    if (info.file.status === 'uploading') {
      // this.isSpinning = true;
      
      if (this.selectedFileUploadType?.trackingProgressUrl  != null &&
            this.selectedFileUploadType?.trackingProgressUrl.length > 0) { 
          this.fileUploadProgress = 0;
      }
      else {
        this.isSpinning = true;
      }
      // console.log(info.file, info.fileList);
    }
    else if (info.file.status === 'done') { 
      this.checkFileUploadProgress(info);
      
    } else if (info.file.status === 'error') {
      // console.log(`${info.file.name} file upload failed.`);
      this.displayFileUploadError(`${info.file.name} file upload failed.`)
    }
  } 

  displayFileUploadError(errorMessage: string) {

    this.isSpinning = false;
    this.fileUploadProgress = 100;
    this.msg.error(errorMessage);
  }

  checkFileUploadProgress(info: NzUploadChangeParam) {

    // console.log(`info.file.response: ${JSON.stringify(info.file.response)}`);

    if (info.file.response.result != null && info.file.response.result != 0) {
        // we get error 
        this.displayFileUploadError(info.file.response.message);
        return;

    }
    else if (this.selectedFileUploadType?.trackingProgressUrl != null &&
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
              // console.log(`${info.file.name} upload progress: ${progress}`);
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
    // console.log(`check if we will need to show the result`);
    // console.log(`this.selectedFileUploadType?.resultUrl: ${this.selectedFileUploadType?.resultUrl}`);

    if (this.selectedFileUploadType?.resultUrl && this.selectedFileUploadType?.resultUrl.length > 0) {
      // the file upload type provide an end point to show the result, let's display the result to the user
      this.showResultModal = true;
      this.fileUploadResults = [];
      this.displayFileUploadResults = [];
      this.resultTotal = 0;
      this.resultSuccess = 0;
      this.resultFail = 0;
    
      this.fileUploadOperationService.getFileUploadResult(
        this.selectedFileUploadType?.resultUrl!, key).subscribe({
       
          next: (fileUploadResultRes) => {
            this.fileUploadResults = fileUploadResultRes;
            this.displayFileUploadResults = fileUploadResultRes;
            this.resultTotal = this.fileUploadResults.length;
            this.resultSuccess = this.fileUploadResults.filter(
              result => result.result == 'success'
            ).length;
            this.resultFail = this.resultTotal - this.resultSuccess;
          
          }

      });
    }
    else {
      
       this.showResultModal = false;
    }
  }
  
  closeResultModal() {
    //  console.log(`close the result modal`)
    this.showResultModal = false;

  }

  removeExistingInventoryChanged() {
    //  console.log(`removeExistingInventory is changed to ${this.removeExistingInventory}`)
    if (this.selectedFileUploadType) { 
      this.refreshFileParameters();
      
    }
    
  } 
  showAllResults() {
    
    this.displayFileUploadResults = this.fileUploadResults;
  }
  showSuccessResults() {
    
    this.displayFileUploadResults = this.fileUploadResults.filter(
      result => result.result == 'success'
    );
  }
  showFailResults() {
    
    this.displayFileUploadResults = this.fileUploadResults.filter(
      result => result.result != 'success'
    );
  }

  startEditFileUploadTypeColumnTable(columnName: string): void {
    this.fileUploadTypeColumnTableEditRowName = columnName;
  }

  stopEditFileUploadTypeColumnTable(columnName:string): void {
    this.fileUploadTypeColumnTableEditRowName = null;

    // save the result back to the server when the user complete
    // editing the table
    const mapToColumnName = this.fileUploadTypeColumnMappings.get(columnName);

    this.isSpinning = true;
        const fileUploadTypeColumnMapping : FileUploadColumnMapping = {
          
  
            companyId: this.companyService.getCurrentCompany()!.id,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,

            type: this.loadFileForm.value.fileTypeSelector,
            columnName: columnName,
            mapToColumnName: mapToColumnName == null ? "" : mapToColumnName,
        }
        this.fileUploadColumnMappingService.addFileUploadColumnMapping(fileUploadTypeColumnMapping).subscribe({
          next: () => {
 
            this.isSpinning = false;
          }, 
          error: () => this.isSpinning = false
        })
  }

  fileUploadTypeColumnMappingChanged(columnName:string, mapToColumnName: string): void {
    this.fileUploadTypeColumnMappings.set(columnName,  mapToColumnName);
    
  }
  
}
