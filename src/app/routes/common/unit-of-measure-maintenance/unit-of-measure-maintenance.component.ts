import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { UnitOfMeasure } from '../models/unit-of-measure';

@Component({
  selector: 'app-common-unit-of-measure-maintenance',
  templateUrl: './unit-of-measure-maintenance.component.html',
})
export class CommonUnitOfMeasureMaintenanceComponent implements OnInit {
  currentUnitOfMeasure: UnitOfMeasure;
  pageTitle: string;

  emptyUnitOfMeasure: UnitOfMeasure = {
    id: 0,
    name: '',
    description: '',
  };

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit() {
    this.loadUnitOfMeasureFromSessionStorage();
    this.setupPageTitle();
  }

  loadUnitOfMeasureFromSessionStorage() {
    this.currentUnitOfMeasure =
      sessionStorage.getItem('unit-of-measure-maintenance.unit-of-measure') === null
        ? this.emptyUnitOfMeasure
        : JSON.parse(sessionStorage.getItem('unit-of-measure-maintenance.unit-of-measure'));
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.unit-of-measure-maintenance.add.title'));
    this.pageTitle = this.i18n.fanyi('page.unit-of-measure-maintenance.add.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('unit-of-measure-maintenance.unit-of-measure', JSON.stringify(this.currentUnitOfMeasure));
    const url = '/inventory/unit-of-measure-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
}
