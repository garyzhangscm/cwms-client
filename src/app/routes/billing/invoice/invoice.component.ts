import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute,  } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Invoice } from '../models/invoice';
import { InvoiceService } from '../services/invoice.service';

@Component({
    selector: 'app-billing-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.less'],
    standalone: false
})
export class BillingInvoiceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  isSpinning = false;
  threePartyLogisticsFlag = false;

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
    {
        title: this.i18n.fanyi("invoiceDate"), 
        render: 'invoiceDateColumn', width: 200,
        iif: () => this.isChoose('invoiceDate') 
    },  
    {
        title: this.i18n.fanyi("dueDate"), 
        render: 'dueDateColumn', width: 200,
        iif: () => this.isChoose('dueDate') 
    },  
    { title: this.i18n.fanyi("totalCharge"),   
        render: 'totalChargeColumn',  
        iif: () => this.isChoose('totalCharge') },    
    { title: this.i18n.fanyi("comment"),  index: 'comment' , 
            iif: () => this.isChoose('comment') },    
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', width: 200, 
      fixed: 'right',
      iif: () => !this.displayOnly
    }
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("referenceNumber"), value: 'referenceNumber', checked: true },
    { label: this.i18n.fanyi("startTime"), value: 'startTime', checked: true },
    { label: this.i18n.fanyi("endTime"), value: 'endTime', checked: true },
    { label: this.i18n.fanyi("invoiceDate"), value: 'startTime', checked: false },
    { label: this.i18n.fanyi("dueDate"), value: 'endTime', checked: false },
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
  
  searchForm!: UntypedFormGroup;
  invoices: Invoice[] = []; 
  searchResult = '';
  availableClients: Client[] = [];
   
  displayOnly = false;
  constructor( 
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private invoiceService: InvoiceService, 
    private warehouseService: WarehouseService,
    private clientService: ClientService,
    private userService: UserService,
    private localCacheService: LocalCacheService, 
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/billing/invoice").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );          
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
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('invoice'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      referenceNumber: [null], 
      clientId: [null], 
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number'] || params['referenceNumber'] ) {
        this.searchForm.value.number.setValue(params['number']);
        this.searchForm.value.referenceNumber.setValue(params['referenceNumber']); 
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
