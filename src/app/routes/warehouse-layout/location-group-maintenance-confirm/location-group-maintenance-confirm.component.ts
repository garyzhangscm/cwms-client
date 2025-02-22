import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { LocationGroup } from '../models/location-group';
import { LocationGroupService } from '../services/location-group.service';

@Component({
    selector: 'app-warehouse-layout-location-group-maintenance-confirm',
    templateUrl: './location-group-maintenance-confirm.component.html',
    standalone: false
})
export class WarehouseLayoutLocationGroupMaintenanceConfirmComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentLocationGroup!: LocationGroup;
  isSpinning = false;
  pageTitle: string;
  constructor(
    private titleService: TitleService,
    private locationGroupService: LocationGroupService,
    private router: Router,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = i18n.fanyi('page.location-group-maintenance.confirm.header.title');
  }

  ngOnInit(): void {
    this.currentLocationGroup = JSON.parse(sessionStorage.getItem('location-group-maintenance.location-group')!);
    this.titleService.setTitle(this.i18n.fanyi('page.location-group-maintenance.confirm.header.title'));
  }

  saveLocationGroup(): void {
    this.isSpinning = true;
    this.locationGroupService.addLocationGroup(this.currentLocationGroup).subscribe(
      {

        next: (res) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/warehouse-layout/location-group?id=${res.id}`);
          }, 2000);
        }, 
        error: () => this.isSpinning = false

      }); 
  }

  onStepIndexChange(): void {
    this.router.navigateByUrl('/warehouse-layout/location-group-maintenance?inprocess=true');
  }
}
