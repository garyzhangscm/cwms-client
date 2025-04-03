import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { Customer } from '../models/customer';

@Component({
    selector: 'app-common-customer-address-maintenance',
    templateUrl: './customer-address-maintenance.component.html',
    standalone: false
})
export class CommonCustomerAddressMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  currentCustomer: Customer | undefined;
  pageTitle = '';

  constructor(private router: Router,
    private titleService: TitleService) { }

  ngOnInit(): void {
    this.loadCustomerFromSessionStorage();
    this.setupPageTitle();
  }

  loadCustomerFromSessionStorage(): void {
    this.currentCustomer = JSON.parse(sessionStorage.getItem('customer-maintenance.customer')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.customer-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.customer-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('customer-maintenance.customer', JSON.stringify(this.currentCustomer));
    const url = '/common/customer-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number): void {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/customer-maintenance');
        break;
      case 2:
        this.router.navigateByUrl('/common/customer-maintenance/confirm');
        break;
      default:
        this.router.navigateByUrl('/common/customer-maintenance/address');
        break;
    }
  }

  handleNewCustomerAddressChange(address: google.maps.places.PlaceResult) {  
    // this.warehouseAddress = address;
    address.address_components!.forEach(
      addressComponent => {
         
        if (addressComponent.types[0] === 'street_number') {
          // street number
          // address line 1 = street number + street name
          this.currentCustomer!.addressLine1 = `${addressComponent.long_name  } ${  this.currentCustomer!.addressLine1}`;
        }
        else if (addressComponent.types[0] === 'route') {
          // street name
          // address line 1 = street number + street name
          this.currentCustomer!.addressLine1 = `${this.currentCustomer!.addressLine1  } ${  addressComponent.long_name}`;
        } 
        else if (addressComponent.types[0] === 'locality') {
          // city
          this.currentCustomer!.addressCity = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_2') {
          // county
          this.currentCustomer!.addressCounty = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_1') {
          // city
          this.currentCustomer!.addressState = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'country') {
          // city
          this.currentCustomer!.addressCountry = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'postal_code') {
          // city
          this.currentCustomer!.addressPostcode = addressComponent.long_name;
        } 
      }

    )
  }

}
