import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Client } from '../models/client';
import { I18NService } from '@core';
import { ClientService } from '../services/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-client-maintenance-confim',
  templateUrl: './client-maintenance-confim.component.html',
})
export class CommonClientMaintenanceConfimComponent implements OnInit {
  currentClient: Client;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private clientService: ClientService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.client-maintenance.confirm.title');
  }

  ngOnInit() {
    this.currentClient = JSON.parse(sessionStorage.getItem('client-maintenance.client'));
    this.titleService.setTitle(this.i18n.fanyi('page.client-maintenance.confirm.title'));
  }

  saveClient() {
    this.clientService.addClient(this.currentClient).subscribe(res => this.router.navigateByUrl('/common/client'));
  }
  onStepIndexChange(event: number) {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/client-maintenance');
        break;
      case 1:
        this.router.navigateByUrl('/common/client-maintenance/address');
        break;
      default:
        this.router.navigateByUrl('/common/client-maintenance/confirm');
        break;
    }
  }
}
