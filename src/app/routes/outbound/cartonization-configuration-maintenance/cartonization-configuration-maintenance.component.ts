import { Component, inject, OnInit } from '@angular/core'; 
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service'; 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CartonizationConfiguration } from '../models/cartonization-configuration';
import { CartonizationGroupRule } from '../models/cartonization-group-rule.enum';
import { PickType } from '../models/pick-type.enum';
import { CartonizationConfigurationService } from '../services/cartonization-configuration.service';

@Component({
    selector: 'app-outbound-cartonization-configuration-maintenance',
    templateUrl: './cartonization-configuration-maintenance.component.html',
    standalone: false
})
export class OutboundCartonizationConfigurationMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;

  cartonizationConfiguration!: CartonizationConfiguration;

  clients: Client[] = [];
  pickTypes = PickType;
  groupRules = CartonizationGroupRule;

  selectedGroupRules: CartonizationGroupRule[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router, 
    private titleService: TitleService,
    private clientService: ClientService,
    private warehouseService: WarehouseService,
    private cartonizationConfigurationService: CartonizationConfigurationService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.cartonization-configuration-maintenance.header.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.cartonization-configuration-maintenance.header.title'));

    this.cartonizationConfiguration = {
      id: undefined,
      sequence: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: this.warehouseService.getCurrentWarehouse(),

      clientId: undefined,
      client: undefined,

      pickType: undefined,
      groupRules: [],

      enabled: false,
    };
    this.activatedRoute.queryParams.subscribe(params => {
      // We are in process of adding a location Group
      // and we already fill in all the information. Let's
      // load the location group from session storage
      if (params['inprocess'] === 'true') {
        this.cartonizationConfiguration = JSON.parse(
          sessionStorage.getItem('cartonization-configuration-maintenance.cartonization-configuration')!,
        );
      } else if (params['id']) {
        this.cartonizationConfigurationService.get(params['id']).subscribe(res => (this.cartonizationConfiguration = res));
      }
    });

    // initiate the select control
    this.clientService.loadClients().subscribe(clientRes => (this.clients = clientRes));
  }

  goToConfirmPage(): void {
    console.log(`cartonizationConfiguration: ${JSON.stringify(this.cartonizationConfiguration)}`);
    sessionStorage.setItem(
      'cartonization-configuration-maintenance.cartonization-configuration',
      JSON.stringify(this.cartonizationConfiguration),
    );
    const url = '/outbound/cartonization-configuration/confirm';
    this.router.navigateByUrl(url);
  }
}
