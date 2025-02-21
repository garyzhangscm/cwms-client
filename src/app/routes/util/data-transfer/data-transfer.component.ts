import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Company } from '../../warehouse-layout/models/company';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { DataTransferRequest } from '../models/data-transfer-request';
import { DataTransferRequestStatus } from '../models/data-transfer-request-status';
import { DataTransferRequestType } from '../models/data-transfer-request-type';
import { DataTransferRequestService } from '../services/data-transfer-request.service';

@Component({
    selector: 'app-util-data-transfer',
    templateUrl: './data-transfer.component.html',
    styleUrls: ['./data-transfer.component.less'],
    standalone: false
})
export class UtilDataTransferComponent implements OnInit {
  isSpinning = false;

  dataTransferRequestStatus = DataTransferRequestStatus;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , 
    iif: () => this.isChoose('description')  }, 
    { title: this.i18n.fanyi("type"),  index: 'type' , 
    iif: () => this.isChoose('type')  }, 
    {
      title: this.i18n.fanyi("company.code"),
      // renderTitle: 'customTitle',
      render: 'companyCode',
      iif: () => this.isChoose('companyCode'), width: 150
    }, 
    {
      title: this.i18n.fanyi("company.name"),
      // renderTitle: 'customTitle',
      render: 'companyName',
      iif: () => this.isChoose('companyName'), width: 150
    }, 
    { title: this.i18n.fanyi("status"),  index: 'status' , 
        iif: () => this.isChoose('status')  },
    {
      title: this.i18n.fanyi("csv-file"),
      // renderTitle: 'customTitle',
      render: 'zipFileUrl',
      iif: () => this.isChoose('zipFileUrl'), width: 150
    },
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("type"), value: 'type', checked: true },
    { label: this.i18n.fanyi("company.code"), value: 'companyCode', checked: true },
    { label: this.i18n.fanyi("company.name"), value: 'companyName', checked: true },
    
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("csv-file"), value: 'zipFileUrl', checked: true },
    
  ];


  validCompanies: Company[] = [];
  searchForm!: UntypedFormGroup;
  dataTransferRequests: DataTransferRequest[] = [];
  searchResult = "";
  
  dataImportRequestForm!: UntypedFormGroup;
  dataImportRequestModal!: NzModalRef;
  dataExportRequestForm!: UntypedFormGroup;
  dataExportRequestModal!: NzModalRef;
   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService, 
    private userService: UserService,
    private dataTransferRequestService: DataTransferRequestService, 
    private modalService: NzModalService,
    private companyService: CompanyService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/util/data-transfer").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                   
       
    }

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

          this.setupAttribute();

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
  setupAttribute() {
    
    this.dataTransferRequests.forEach(
      dataTransferRequest => {
        // setup the company

        if(!dataTransferRequest.company) {
          // get the company from the existing list
          dataTransferRequest.company = this.validCompanies.find(company => company.id === dataTransferRequest.companyId);
        }
        if(!dataTransferRequest.company) {
          // if we can't get the company from the existing list
          this.companyService.getCompany(dataTransferRequest.companyId).subscribe({
            next: (companyRes) => dataTransferRequest.company = companyRes
          });
        }

        // setup the file URL
        dataTransferRequest.zipFileUrl = `${environment.api.baseUrl}/admin/data-transfer/csv-download/${dataTransferRequest.id}`;
        dataTransferRequest.dataTransferRequestDetails.forEach(
          dataTransferRequestDetail => {
            dataTransferRequestDetail.fileUrl = `${environment.api.baseUrl}/admin/data-transfer/csv-download/${dataTransferRequest.id}/${dataTransferRequestDetail.tablesName}`
          }
        )
      }
    )
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
          this.dataExportRequestForm.value.number.value,
          this.dataExportRequestForm.value.companyCode.value,
          this.dataExportRequestForm.value.description.value,
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
                  this.searchForm.value.number.setValue(number);
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
          this.dataImportRequestForm.value.number.value,
          this.dataImportRequestForm.value.companyCode.value,
          this.dataImportRequestForm.value.description.value,
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
                  this.searchForm.value.number.setValue(number);
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
