import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Client } from '../models/client';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../services/client.service';
import { I18NService } from '@core';

@Component({
  selector: 'app-common-client-maintenance',
  templateUrl: './client-maintenance.component.html',
})
export class CommonClientMaintenanceComponent implements OnInit {
  currentClient: Client;
  pageTitle: string;

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

  ngOnInit() {
    this.loadClientFromSessionStorage();
    this.setupPageTitle();
  }

  loadClientFromSessionStorage() {
    this.currentClient =
      sessionStorage.getItem('client-maintenance.client') === null
        ? this.emptyClient
        : JSON.parse(sessionStorage.getItem('client-maintenance.client'));
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.client-maintenance.add.title'));
    this.pageTitle = this.i18n.fanyi('page.client-maintenance.add.title');
  }
  goToAddressPage(): void {
    sessionStorage.setItem('client-maintenance.client', JSON.stringify(this.currentClient));
    const url = '/common/client-maintenance/address';
    this.router.navigateByUrl(url);
  }
}
