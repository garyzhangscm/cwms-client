import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { CartonizationConfiguration } from '../models/cartonization-configuration';
import { I18NService } from '@core';
import { CartonizationConfigurationService } from '../services/cartonization-configuration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-outbound-cartonization-configuration-confirm',
  templateUrl: './cartonization-configuration-confirm.component.html',
})
export class OutboundCartonizationConfigurationConfirmComponent implements OnInit {
  currentCartonizationConfiguration: CartonizationConfiguration;

  pageTitle: string;
  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private cartonizationConfigurationService: CartonizationConfigurationService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.cartonization-configuration-maintenance.confirm.header.title');
  }

  ngOnInit() {
    this.currentCartonizationConfiguration = JSON.parse(
      sessionStorage.getItem('cartonization-configuration-maintenance.cartonization-configuration'),
    );
    this.titleService.setTitle(this.i18n.fanyi('page.cartonization-configuration-maintenance.confirm.header.title'));
  }

  save() {
    this.cartonizationConfigurationService
      .add(this.currentCartonizationConfiguration)
      .subscribe(res => this.router.navigateByUrl(`/outbound/cartonization-configuration?sequence=${res.sequence}`));
  }

  onStepIndexChange() {
    this.router.navigateByUrl('/outbound/cartonization-configuration/maintenance?inprocess=true');
  }
}
