import { Component, inject, OnInit } from '@angular/core';
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
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentCartonizationConfiguration!: CartonizationConfiguration;

  pageTitle: string;
  constructor( 
    private titleService: TitleService,
    private cartonizationConfigurationService: CartonizationConfigurationService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.cartonization-configuration-maintenance.confirm.header.title');
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
