import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'app-common-client-maintenance',
  templateUrl: './client-maintenance.component.html',
})
export class CommonClientMaintenanceComponent implements OnInit {
  currentClient: Client | undefined;
  pageTitle = '';

  emptyClient: Client = {
    id: 0,
    name: '',
    description: '',
    contactorFirstname: '',
    contactorLastname: '',
    addressCountry: '',
    addressState: '',
    addressCounty: '',
    addressCity: '',
    addressDistrict: '',
    addressLine1: '',
    addressLine2: '',
    addressPostcode: '',
  };

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit(): void {
    this.loadClientFromSessionStorage();
    this.setupPageTitle();
  }

  loadClientFromSessionStorage(): void {
    this.currentClient =
      sessionStorage.getItem('client-maintenance.client') === null
        ? this.emptyClient
        : JSON.parse(sessionStorage.getItem('client-maintenance.client')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.client-maintenance.add.title'));
    this.pageTitle = this.i18n.fanyi('page.client-maintenance.add.title');
  }
  goToAddressPage(): void {
    sessionStorage.setItem('client-maintenance.client', JSON.stringify(this.currentClient));
    const url = '/common/client-maintenance/address';
    this.router.navigateByUrl(url);
  }
}
