import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import {  ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn,   } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { Carrier } from '../models/carrier';
import { CarrierService } from '../services/carrier.service';

@Component({
    selector: 'app-transportation-carrier',
    templateUrl: './carrier.component.html',
    styleUrls: ['./carrier.component.less'],
    standalone: false
})
export class TransportationCarrierComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;
  
  searchForm!: UntypedFormGroup;
  listOfCarriers: Carrier[] = [];
  searchResult = '';

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("name"), index: 'name', },
    { title: this.i18n.fanyi("description"), index: 'description', },   
    { title: this.i18n.fanyi("enabled"), index: 'enabled',  type: 'yn'},   
    { title: this.i18n.fanyi("contactorFirstname"), index: 'contactorFirstname', },   
    { title: this.i18n.fanyi("contactorLastname"), index: 'contactorLastname', },   
    { title: this.i18n.fanyi("trackingInfoUrl"), index: 'trackingInfoUrl', },   
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder, 
    private carrierService: CarrierService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, ) {
      userService.isCurrentPageDisplayOnly("/transportation/carrier").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );               
     }

    ngOnInit(): void {
      this.titleService.setTitle(this.i18n.fanyi('menu.main.transport.carrier'));
      // initiate the search form
      this.searchForm = this.fb.group({
        name: [null], 
      });
  
      // IN case we get the number passed in, refresh the display
      // and show the order information
      this.activatedRoute.queryParams.subscribe(params => {
        if (params['name']) {
          this.searchForm.value.name.setValue(params['name']);
          this.search();
        }
      });
    }

  
  resetForm(): void {
    this.searchForm.reset();
    this.listOfCarriers = []; 

  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
     

    this.carrierService.getCarriers(
      this.searchForm.value.name.value).subscribe({
        next: (carriersRes) => {

          this.listOfCarriers = carriersRes;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: carriersRes.length,
          });
        }, 
        error: () => this.isSpinning = false
      });
  }
   
  disableCarrier(carrierId: number) {
    this.isSpinning = true; 
     

    this.carrierService.disableCarrier(carrierId).subscribe({
        next: () => {
          this.isSpinning = false;
          this.search();
        }, 
        error: () => this.isSpinning = false
      });
  }
  removeCarrier(carrierId: number) {
    this.isSpinning = true; 

    this.carrierService.removeCarrier(carrierId).subscribe({
        next: () => {
          this.isSpinning = false;
          this.search();
        }, 
        error: () => this.isSpinning = false
      });
  }

}
