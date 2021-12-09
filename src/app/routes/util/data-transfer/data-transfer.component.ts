import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Company } from '../../warehouse-layout/models/company';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { DataTransferRequest } from '../models/data-transfer-request';
import { DataTransferRequestType } from '../models/data-transfer-request-type';
import { DataTransferRequestService } from '../services/data-transfer-request.service';

@Component({
  selector: 'app-util-data-transfer',
  templateUrl: './data-transfer.component.html',
  styleUrls: ['./data-transfer.component.less']
})
export class UtilDataTransferComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , 
    iif: () => this.isChoose('description')  }, 
    { title: this.i18n.fanyi("type"),  index: 'type' , 
    iif: () => this.isChoose('type')  }, 
    { title: this.i18n.fanyi("company.code"),  index: 'companyCode' , 
    iif: () => this.isChoose('companyCode')  },     
    { title: this.i18n.fanyi("status"),  index: 'status' , 
    iif: () => this.isChoose('status')  }
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("type"), value: 'type', checked: true },
    { label: this.i18n.fanyi("company.code"), value: 'companyCode', checked: true },
    
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    
  ];


  validCompanies: Company[] = [];
  searchForm!: FormGroup;
  dataTransferRequests: DataTransferRequest[] = [];
  searchResult = "";
  
  dataImportRequestForm!: FormGroup;
  dataImportRequestModal!: NzModalRef;
  dataExportRequestForm!: FormGroup;
  dataExportRequestModal!: NzModalRef;
   
  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private dataTransferRequestService: DataTransferRequestService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private companyService: CompanyService,
    private fb: FormBuilder,) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.data-transfer'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      companyCode: [null]
    });

    this.companyService.getCompanies().subscribe({
      next: (companyRes) => this.validCompanies = companyRes
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
    
  resetForm(): void {
    this.searchForm.reset();
    this.dataTransferRequests = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.dataTransferRequestService
      .getDataTransferRequests(this.searchForm.value.number, this.searchForm.value.companyCode)
      .subscribe({

        next: (dataTransferRequestRes) => {
          this.dataTransferRequests = dataTransferRequestRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: dataTransferRequestRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }

  
  openDataExportRequestModal(
    tplDataExportRequestModalTitle: TemplateRef<{}>,
    tplDataExportRequestModalContent: TemplateRef<{}>,
  ): void {
    
    this.dataExportRequestForm = this.fb.group({
      number: [null],
      description: [null],
      companyCode: [null],
    });

    // Load the location
    this.dataExportRequestModal = this.modalService.create({
      nzTitle: tplDataExportRequestModalTitle,
      nzContent: tplDataExportRequestModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.dataExportRequestModal.destroy();
      },
      nzOnOk: () => {
        this.addDataExportRequest( 
          this.dataExportRequestForm.controls.number.value,
          this.dataExportRequestForm.controls.companyCode.value,
          this.dataExportRequestForm.controls.description.value,
        );
      },

      nzWidth: 1000,
    });
  }

  addDataExportRequest(number: string, companyCode: string, description: string, ) {

    this.isSpinning = true;
    this.companyService.getCompanies(companyCode).subscribe(
      {
        next:(companyRes) => {
          if (companyRes.length === 1) {
            this.dataTransferRequestService.addDataTransferRequest(
              number, companyRes[0].id, description, DataTransferRequestType.EXPORT
            ).subscribe(
              {
                next: () => {
                  
                  this.isSpinning = false;
                  this.searchForm.controls.number.setValue(number);
                  this.search();
                }, 
                error: () => this.isSpinning = false
              }
            );
          }
          else {
            this.isSpinning = false;
          }
        }, 
        error: () => this.isSpinning = false
      }
    )
    
  }

  
  openDataImportRequestModal(
    tplDataImportRequestModalTitle: TemplateRef<{}>,
    tplDataImportRequestModalContent: TemplateRef<{}>,
  ): void {
    
    this.dataImportRequestForm = this.fb.group({
      number: [null],
      description: [null],
      companyCode: [null],
    });

    // Load the location
    this.dataExportRequestModal = this.modalService.create({
      nzTitle: tplDataImportRequestModalTitle,
      nzContent: tplDataImportRequestModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.dataImportRequestModal.destroy();
      },
      nzOnOk: () => {
        this.addDataImportRequest( 
          this.dataImportRequestForm.controls.number.value,
          this.dataImportRequestForm.controls.companyCode.value,
          this.dataImportRequestForm.controls.description.value,
        );
      },

      nzWidth: 1000,
    });
  }

  addDataImportRequest(number: string, companyCode: string, description: string, ) {

    this.isSpinning = true;
    this.companyService.getCompanies(companyCode).subscribe(
      {
        next:(companyRes) => {
          if (companyRes.length === 1) {
            this.dataTransferRequestService.addDataTransferRequest(
              number, companyRes[0].id, description, DataTransferRequestType.IMPORT
            ).subscribe(
              {
                next: () => {
                  
                  this.isSpinning = false;
                  this.searchForm.controls.number.setValue(number);
                  this.search();
                }, 
                error: () => this.isSpinning = false
              }
            );
          }
          else {
            this.isSpinning = false;
          }
        }, 
        error: () => this.isSpinning = false
      }
    )
    
  }

}
