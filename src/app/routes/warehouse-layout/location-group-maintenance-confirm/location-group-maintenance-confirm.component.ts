import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { LocationGroup } from '../models/location-group';
import { I18NService } from '@core';
import { Router } from '@angular/router';
import { LocationGroupService } from '../services/location-group.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-warehouse-layout-location-group-maintenance-confirm',
  templateUrl: './location-group-maintenance-confirm.component.html',
})
export class WarehouseLayoutLocationGroupMaintenanceConfirmComponent implements OnInit {
  currentLocationGroup: LocationGroup;

  pageTitle: string;
  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private locationGroupService: LocationGroupService,
    private router: Router,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = i18n.fanyi('page.location-group-maintenance.confirm.header.title');
  }

  ngOnInit() {
    this.currentLocationGroup = JSON.parse(sessionStorage.getItem('location-group-maintenance.location-group'));
    this.titleService.setTitle(this.i18n.fanyi('page.location-group-maintenance.confirm.header.title'));
  }

  saveLocationGroup() {
    this.locationGroupService.addLocationGroup(this.currentLocationGroup).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      setTimeout(() => {
        this.router.navigateByUrl(`/warehouse-layout/location-group?id=${res.id}`);
      }, 2000);
    });
  }

  onStepIndexChange() {
    this.router.navigateByUrl('/warehouse-layout/location-group-maintenance?inprocess=true');
  }
}
