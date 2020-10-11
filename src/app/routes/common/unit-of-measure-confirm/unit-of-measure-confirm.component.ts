import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { UnitOfMeasure } from '../models/unit-of-measure';
import { UnitOfMeasureService } from '../services/unit-of-measure.service';

@Component({
  selector: 'app-common-unit-of-measure-confirm',
  templateUrl: './unit-of-measure-confirm.component.html',
})
export class CommonUnitOfMeasureConfirmComponent implements OnInit {
  currentUnitOfMeasure: UnitOfMeasure | undefined;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private unitOfMeasureService: UnitOfMeasureService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.unit-of-measure-maintenance.confirm.title');
  }

  ngOnInit(): void {
    this.currentUnitOfMeasure = JSON.parse(sessionStorage.getItem('unit-of-measure-maintenance.unit-of-measure')!);
    this.titleService.setTitle(this.i18n.fanyi('page.unit-of-measure-maintenance.confirm.title'));
  }

  saveUnitOfMeasure(): void {
    this.unitOfMeasureService
      .addUnitOfMeasure(this.currentUnitOfMeasure!)
      .subscribe(res => this.router.navigateByUrl('/common/unit-of-measure'));
  }
  onStepIndexChange(event: number): void {
    this.router.navigateByUrl('/common/unit-of-measure');
  }
}
