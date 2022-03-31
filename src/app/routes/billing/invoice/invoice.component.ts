import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Invoice } from '../models/invoice';
import { InvoiceService } from '../services/invoice.service';

@Component({
  selector: 'app-billing-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.less']
})
export class BillingInvoiceComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("number"),  index: 'number' ,
        iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("referenceNumber"),  index: 'referenceNumber' , 
        iif: () => this.isChoose('referenceNumber') }, 
    {
        title: this.i18n.fanyi("startTime"), 
        render: 'startTimeColumn', width: 200,
        iif: () => this.isChoose('startTime') 
    },    
    {
        title: this.i18n.fanyi("endTime"), 
        render: 'endTimeColumn', width: 200,
        iif: () => this.isChoose('endTime') 
    },  
    { title: this.i18n.fanyi("totalCharge"),  index: 'totalCharge' , 
        iif: () => this.isChoose('totalCharge') },    
    { title: this.i18n.fanyi("comment"),  index: 'comment' , 
            iif: () => this.isChoose('comment') },    
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', width: 200, 
      fixed: 'right',
    }
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("referenceNumber"), value: 'referenceNumber', checked: true },
    { label: this.i18n.fanyi("startTime"), value: 'startTime', checked: true },
    { label: this.i18n.fanyi("endTime"), value: 'endTime', checked: true },
    { label: this.i18n.fanyi("totalCharge"), value: 'totalCharge', checked: true },
    { label: this.i18n.fanyi("comment"), value: 'comment', checked: true }, 
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
        this.st!.resetColumns({ emitReload: true });

    }
  }
  
  searchForm!: FormGroup;
  invoices: Invoice[] = []; 
  searchResult = '';
  availableClients: Client[] = [];
   
  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private invoiceService: InvoiceService,
    private messageService: NzMessageService,
    private warehouseService: WarehouseService,
    private clientService: ClientService,
    private router: Router, 
    private fb: FormBuilder,) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('invoice'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      referenceNumber: [null], 
      clientId: [null], 
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number || params.referenceNumber ) {
        this.searchForm.controls.number.setValue(params.number);
        this.searchForm.controls.referenceNumber.setValue(params.referenceNumber); 
        this.search();
      }
    });

    this.loadClients();
  }

  loadClients() {
    this.clientService.loadClients().subscribe(
      {
        next: (clientRes) => this.availableClients = clientRes
      }
    )
  }
    
  resetForm(): void {
    this.searchForm.reset();
    this.invoices = []; 
  }
  search(): void {
    this.isSpinning = true;  

    this.invoiceService
      .getInvoices(this.warehouseService.getCurrentWarehouse().id,
        this.searchForm.value.clientId? this.searchForm.value.clientId : undefined,

         this.searchForm.value.number, 
         this.searchForm.value.referenceNumber, )
      .subscribe({

        next: (invoiceRes) => {
          this.invoices = invoiceRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: invoiceRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
  
   
}