import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';

import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Component({
    selector: 'app-common-client-address-maintenance',
    templateUrl: './client-address-maintenance.component.html',
    standalone: false
})
export class CommonClientAddressMaintenanceComponent implements OnInit {
  currentClient: Client | undefined;
  pageTitle = '';
  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit(): void {
    this.loadClientFromSessionStorage();
    this.setupPageTitle();
  }

  loadClientFromSessionStorage(): void {
    this.currentClient = JSON.parse(sessionStorage.getItem('client-maintenance.client')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.client-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.client-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('client-maintenance.client', JSON.stringify(this.currentClient));
    const url = '/common/client-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number): void {
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
