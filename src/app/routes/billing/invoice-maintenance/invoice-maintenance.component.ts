import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { DateTimeService } from '../../util/services/date-time.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillingRequest } from '../models/billing-request';
import { Invoice } from '../models/invoice';
import { BillingRequestService } from '../services/billing-request.service';
import { InvoiceService } from '../services/invoice.service';

@Component({
    selector: 'app-billing-invoice-maintenance',
    templateUrl: './invoice-maintenance.component.html',
    standalone: false
})
export class BillingInvoiceMaintenanceComponent implements OnInit { 
  
  currentInvoice: Invoice;  
  invoiceNumberValidateStatus = 'warning'; 
  stepIndex = 0; 
  isSpinning = false; 
  pageTitle: string;

  includeDaysSinceInWarehouseForStorageFee = false;
 

  availableClients: Client[] = [];
  dateRange = null;

  billingRequests: BillingRequest[] = [];
  selectedBillingRequests: BillingRequest[] = [];

  // billing request table
  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: '', index: 'number', type: 'checkbox' },
    { title: this.i18n.fanyi("number"),  index: 'number' ,  },   
    
    {
      title: this.i18n.fanyi("billableCategory"), 
      render: 'billableCategoryColumn', 
    },     
    { title: this.i18n.fanyi("rate"),  index: 'rate' ,  },  
    { title: this.i18n.fanyi("billingCycle"),  index: 'billingCycle' ,  },  
    { title: this.i18n.fanyi("totalAmount"), 
    render: 'totalAmountColumn',   },  
    { title: this.i18n.fanyi("totalCharge"),  
    render: 'totalChargeColumn',   },  
    
     
  ]; 
  @ViewChild('st', { static: false })
  st2!: STComponent;
  columns2: STColumn[] = [
      
    { title: this.i18n.fanyi("number"),  index: 'number' ,  },   
    {
      title: this.i18n.fanyi("billableCategory"), 
      render: 'billableCategoryColumn', 
    },    
    { title: this.i18n.fanyi("rate"),  index: 'rate' ,  },  
    { title: this.i18n.fanyi("billingCycle"),  index: 'billingCycle' ,  },  
    { title: this.i18n.fanyi("totalAmount"), 
    render: 'totalAmountColumn',   },  
    { title: this.i18n.fanyi("totalCharge"),  
    render: 'totalChargeColumn',   },  
    
     
  ]; 
  
  constructor(private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private invoiceService: InvoiceService,
    private titleService: TitleService,
    private warehouseService: WarehouseService, 
    private companyService: CompanyService,
    private dateTimeService: DateTimeService,
    private messageService: NzMessageService, 
    private clientService: ClientService,
    private billingRequestService: BillingRequestService,
    private router: Router,) { 
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
    if (this.stepIndex == 1) {
      this.generateBillingRequest();
    }
    else if (this.stepIndex == 2) {
      this.calculateInvoiceTotalCharge();
    }
  }

  // calculate the invoice's total change from selected billing request
  calculateInvoiceTotalCharge() {

    this.currentInvoice.totalCharge = 
        this.selectedBillingRequests.map(
          billingRequest => billingRequest.totalCharge
        ).reduce((sum, current) => sum + current, 0);
  }
  generateBillingRequest() {
    this.isSpinning = true;
    this.billingRequests = [];
    // convert the start time and end time to the beginining of the start date 
    // and end of the end date and then convert to UTC 
    this.billingRequestService.generateBillingRequests(
        this.currentInvoice.startTime!, 
        this.currentInvoice.endTime!,
        this.currentInvoice.clientId,
        undefined,
        false, 
        this.includeDaysSinceInWarehouseForStorageFee
    ).subscribe(
      {
        next: (billingRequestRes) => {
          this.billingRequests = billingRequestRes;
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false

      }
    )

  }
  passValidation() : boolean {

    if (this.stepIndex === 0) { 
      return this.invoiceNumberValidateStatus === 'success' &&
          this.currentInvoice.startTime != null &&
          this.currentInvoice.endTime != null;
    }
    else if (this.stepIndex === 1) {
      // the user must at least select one billing request
      // in order to generate the invoice
      return this.selectedBillingRequests.length > 0;
    }

    return true;
  }
  onDateRangeChange(result: Date[]): void {
    console.log('onChange: ', result);
    this.currentInvoice.startTime = result[0];
    this.currentInvoice.endTime = result[1];
  }

  billingRequestTableChanged(event: STChange) : void { 
    // console.log(`event.type: ${event.type}`);

    if (event.type === 'checkbox') {
      
      this.selectedBillingRequests = [];
      const dataList: STData[] = this.st.list; 
      dataList
          .filter( data => data.checked)
          .forEach(
            data => {
              // get the selected billing request and added it to the 
              // selectedBillingRequests
              this.selectedBillingRequests = [...this.selectedBillingRequests,
                  ...this.billingRequests.filter(
                    billingRequest => billingRequest.number == data["number"]

                  )
              ]

            }
          );
    } 

  }
  confirm() {
    this.isSpinning = true;
    this.invoiceService.generateInvoiceFromBillingRequest(
      this.currentInvoice.number, 
      this.currentInvoice.startTime!, 
      this.currentInvoice.endTime!,
      this.selectedBillingRequests, 
      this.currentInvoice.clientId,
      this.currentInvoice.referenceNumber,
      this.currentInvoice.comment
    ).subscribe(
      {
        next: (invoiceRes) => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/billing/invoice?number=${invoiceRes.number}`);
          }, 500);
        },
        error: () => this.isSpinning = false
      }
    )
  }
}
