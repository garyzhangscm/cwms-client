import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'app-common-client-maintenance-confim',
  templateUrl: './client-maintenance-confim.component.html',
})
export class CommonClientMaintenanceConfimComponent implements OnInit {
  currentClient: Client | undefined;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private clientService: ClientService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.client-maintenance.confirm.title');
  }

  ngOnInit(): void {
    this.currentClient = JSON.parse(sessionStorage.getItem('client-maintenance.client')!);
    this.titleService.setTitle(this.i18n.fanyi('page.client-maintenance.confirm.title'));
  }

  saveClient(): void {
    this.clientService.addClient(this.currentClient!).subscribe(res => this.router.navigateByUrl('/common/client'));
  }
  onStepIndexChange(event: number): void {
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
