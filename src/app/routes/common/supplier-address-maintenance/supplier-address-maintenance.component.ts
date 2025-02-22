import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

import { Supplier } from '../models/supplier';

@Component({
    selector: 'app-common-supplier-address-maintenance',
    templateUrl: './supplier-address-maintenance.component.html',
    standalone: false
})
export class CommonSupplierAddressMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentSupplier: Supplier | undefined;
  pageTitle = '';

  constructor(private router: Router, 
    private titleService: TitleService) { }

  ngOnInit(): void {
    this.loadSupplierFromSessionStorage();
    this.setupPageTitle();
    // this.loadScript('https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyDkPmh0PEC7JTCutUhWuN3BUU38M2fvR5s&sensor=false&language=en');
  }

  loadSupplierFromSessionStorage(): void {
    this.currentSupplier = JSON.parse(sessionStorage.getItem('supplier-maintenance.supplier')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.supplier-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.supplier-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('supplier-maintenance.supplier', JSON.stringify(this.currentSupplier));
    const url = '/common/supplier-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number): void {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/supplier-maintenance');
        break;
      case 2:
        this.router.navigateByUrl('/common/supplier-maintenance/confirm');
        break;
      default:
        this.router.navigateByUrl('/common/supplier-maintenance/address');
        break;
    }
  }

  handleNewSupplierAddressChange(address: Address) {  
    // this.warehouseAddress = address;
    address.address_components.forEach(
      addressComponent => {
         
        if (addressComponent.types[0] === 'street_number') {
          // street number
          // address line 1 = street number + street name
          this.currentSupplier!.addressLine1 = `${addressComponent.long_name  } ${  this.currentSupplier!.addressLine1}`;
        }
        else if (addressComponent.types[0] === 'route') {
          // street name
          // address line 1 = street number + street name
          this.currentSupplier!.addressLine1 = `${this.currentSupplier!.addressLine1  } ${  addressComponent.long_name}`;
        } 
        else if (addressComponent.types[0] === 'locality') {
          // city
          this.currentSupplier!.addressCity = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_2') {
          // county
          this.currentSupplier!.addressCounty = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_1') {
          // city
          this.currentSupplier!.addressState = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'country') {
          // city
          this.currentSupplier!.addressCountry = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'postal_code') {
          // city
          this.currentSupplier!.addressPostcode = addressComponent.long_name;
        } 
      }

    )
  }
  
  public loadScript(url: string) {
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }

}
