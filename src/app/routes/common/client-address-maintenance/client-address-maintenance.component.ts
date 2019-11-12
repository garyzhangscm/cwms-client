import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../services/client.service';
import { I18NService } from '@core';
import { Client } from '../models/client';

@Component({
  selector: 'app-common-client-address-maintenance',
  templateUrl: './client-address-maintenance.component.html',
})
export class CommonClientAddressMaintenanceComponent implements OnInit {
  currentClient: Client;
  pageTitle: string;

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit() {
    this.loadClientFromSessionStorage();
    this.setupPageTitle();
  }

  loadClientFromSessionStorage() {
    this.currentClient = JSON.parse(sessionStorage.getItem('client-maintenance.client'));
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.client-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.client-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('client-maintenance.client', JSON.stringify(this.currentClient));
    const url = '/common/client-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number) {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/client-maintenance');
        break;
      case 2:
        this.router.navigateByUrl('/common/client-maintenance/confirm');
        break;
      default:
        this.router.navigateByUrl('/common/client-maintenance/address');
        break;
    }
  }
}
