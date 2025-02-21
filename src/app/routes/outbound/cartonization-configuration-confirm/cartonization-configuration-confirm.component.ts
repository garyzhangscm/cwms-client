import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { CartonizationConfiguration } from '../models/cartonization-configuration';
import { CartonizationConfigurationService } from '../services/cartonization-configuration.service';

@Component({
    selector: 'app-outbound-cartonization-configuration-confirm',
    templateUrl: './cartonization-configuration-confirm.component.html',
    standalone: false
})
export class OutboundCartonizationConfigurationConfirmComponent implements OnInit {
  currentCartonizationConfiguration!: CartonizationConfiguration;

  pageTitle: string;
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private cartonizationConfigurationService: CartonizationConfigurationService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.cartonization-configuration-maintenance.confirm.header.title');
  }

  ngOnInit(): void {
    this.currentCartonizationConfiguration = JSON.parse(
      sessionStorage.getItem('cartonization-configuration-maintenance.cartonization-configuration')!,
    );
    this.titleService.setTitle(this.i18n.fanyi('page.cartonization-configuration-maintenance.confirm.header.title'));
  }

  save(): void {
    this.cartonizationConfigurationService
      .add(this.currentCartonizationConfiguration)
      .subscribe(res => this.router.navigateByUrl(`/outbound/cartonization-configuration?sequence=${res.sequence}`));
  }

  onStepIndexChange(): void {
    this.router.navigateByUrl('/outbound/cartonization-configuration/maintenance?inprocess=true');
  }
}
