import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { ReportService } from '../../report/services/report.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Invoice } from '../models/invoice';
import { InvoiceService } from '../services/invoice.service';

@Component({
    selector: 'app-billing-vendor-invoice-maintenance',
    templateUrl: './vendor-invoice-maintenance.component.html',
    styleUrls: ['./vendor-invoice-maintenance.component.less'],
    standalone: false
})
export class BillingVendorInvoiceMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentInvoice!: Invoice;
  
  fileList: NzUploadFile[] = [];
  threePartyLogisticsFlag = false;
  

  templateFileUploadUrl = '';
  acceptUploadedFileTypes = '.pdf'; 
  isSpinning = false;
  invoiceNumberValidateStatus = 'warning'; 

  
  availableClients: Client[] = [];

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private companyService: CompanyService,
    private warehouseService: WarehouseService,
    private userService: UserService,
    private reportService: ReportService,
    private messageService: NzMessageService,
    private invoiceService: InvoiceService,
    private router: Router,
    private localCacheService: LocalCacheService,
    private clientService: ClientService,
  ) {
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        }
        
      },
    });

    this.currentInvoice = {        

      companyId: companyService.getCurrentCompany()!.id,
      warehouseId: warehouseService.getCurrentWarehouse().id, 
  
      number: "",
      referenceNumber:  "",
      comment:  "", 
      lines: [],
      totalCharge: 0,
      
    }
  this.pageTitle = this.i18n.fanyi('invoice');

  }

  ngOnInit(): void {
    this.fileList = [];
    
    
    this.templateFileUploadUrl = `admin/invoices/upload/pdf`;
    
    this.stepIndex = 0;
    this.loadClients();
  }

  
  loadClients() {
    this.clientService.loadClients().subscribe(
      {
        next: (clientRes) => this.availableClients = clientRes
      }
    )
  }

  clientChanged() {
    this.currentInvoice.clientId = this.currentInvoice.client?.id;
  }
 
  passValidation() : boolean {

    if (this.stepIndex === 0) { 
      return this.invoiceNumberValidateStatus === 'success'
    }
    return true;
  } 

  invoiceNumberChange(event: Event) {  
    this.currentInvoice!.number = (event.target as HTMLInputElement).value;
    if (this.currentInvoice!.number) {
      // THE USER input the sample number, let's make sure it is not exists yet
      this.invoiceService.getInvoices(undefined, undefined, this.currentInvoice!.number).subscribe({
        next: (invoiceRes) => {
          if (invoiceRes.length > 0) {
            // the order is already exists 
            this.invoiceNumberValidateStatus = 'numberExists'
          }
        }
      })
      this.invoiceNumberValidateStatus = 'success'
    }
    else {
      this.invoiceNumberValidateStatus = 'required'
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

  confirm(): void {
    
  }

  handleUploadChange(info: NzUploadChangeParam): void { 
    if (info.file.status === 'done') {
      this.messageService.success(`${info.file.name} ${this.i18n.fanyi('file.upload.success')}`);
 
        
      this.currentInvoice.fileName = info.file.name; 
      let url = `${environment.api.baseUrl}admin/invoice/upload/pdf`;
 
      url = `${url}/${info.file.response.data}`;
 

      this.fileList = [
        ...this.fileList,
        {
          uid: info.file.uid,
          name: info.file.name,
          status: info.file.status,
          response: '', // custom error message to show
          url: url
        }
      ];
    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
    }

    
  }
 

}
