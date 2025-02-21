import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { PurchaseOrder } from '../../inbound/models/purchase-order';
import { Company } from '../../warehouse-layout/models/company';
import { CompanyService } from '../../warehouse-layout/services/company.service';

@Component({
    selector: 'app-util-company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.less'],
    standalone: false
})
export class UtilCompanyComponent implements OnInit {

  isSpinning = false;

  companies: Company[] = [];

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("company.code"),  index: 'code' , }, 
    { title: this.i18n.fanyi("name"),  index: 'name' , }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , },  
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ]; 

  
  searchForm!: UntypedFormGroup; 
  searchResult = ""; 
 
   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,    
    private companyService: CompanyService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/util/company").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                   
     
    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.company'));
    // initiate the search form
    this.searchForm = this.fb.group({
      code: [null],
      name: [null], 
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
   
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.companies = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.companyService
      .getCompanies(this.searchForm.value.code, 
        this.searchForm.value.name, )
      .subscribe({

        next: (companyRes) => {
          this.companies = companyRes;
           
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: companyRes.length
          });
           

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }  
  
  enableCompany(companyId: number) : void {
    this.isSpinning = true; 
    this.companyService
      .enableCompany(companyId)
      .subscribe({

        next: () => { 
           
          this.isSpinning = false;
          this.search();
           

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
  }

  disableCompany(companyId: number) : void {
    this.isSpinning = true; 
    this.companyService
      .disableCompany(companyId)
      .subscribe({

        next: () => { 
           
          this.isSpinning = false;
          this.search();
           

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
  }
}
