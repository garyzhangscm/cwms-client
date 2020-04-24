import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Client } from '../../common/models/client';
import { PickType } from '../models/pick-type.enum';
import { LocationVolumeTrackingPolicy } from '../../warehouse-layout/models/location-volume-tracking-policy.enum';
import { InventoryConsolidationStrategy } from '../../warehouse-layout/models/inventory-consolidation-strategy.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { ClientService } from '../../common/services/client.service';
import { CartonizationConfiguration } from '../models/cartonization-configuration';
import { CartonizationGroupRule } from '../models/cartonization-group-rule.enum';
import { CartonizationConfigurationService } from '../services/cartonization-configuration.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Component({
  selector: 'app-outbound-cartonization-configuration-maintenance',
  templateUrl: './cartonization-configuration-maintenance.component.html',
})
export class OutboundCartonizationConfigurationMaintenanceComponent implements OnInit {
  pageTitle: string;

  cartonizationConfiguration: CartonizationConfiguration;

  clients: Client[];
  pickTypes = PickType;
  groupRules = CartonizationGroupRule;

  selectedGroupRules: CartonizationGroupRule[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18NService,
    private titleService: TitleService,
    private clientService: ClientService,
    private warehouseService: WarehouseService,
    private cartonizationConfigurationService: CartonizationConfigurationService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.cartonization-configuration-maintenance.header.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.cartonization-configuration-maintenance.header.title'));

    this.cartonizationConfiguration = {
      id: null,
      sequence: null,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: this.warehouseService.getCurrentWarehouse(),

      clientId: null,
      client: null,

      pickType: null,
      groupRules: null,

      enabled: false,
    };
    this.activatedRoute.queryParams.subscribe(params => {
      // We are in process of adding a location Group
      // and we already fill in all the information. Let's
      // load the location group from session storage
      if (params.inprocess === 'true') {
        this.cartonizationConfiguration = JSON.parse(
          sessionStorage.getItem('cartonization-configuration-maintenance.cartonization-configuration'),
        );
      } else if (params.id) {
        this.cartonizationConfigurationService.get(params.id).subscribe(res => (this.cartonizationConfiguration = res));
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
