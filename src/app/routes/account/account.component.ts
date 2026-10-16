import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderModule } from '@delon/abc/page-header';
import { I18nPipe, SettingsService } from '@delon/theme';

import { HeaderI18nComponent } from '../../layout/basic/widgets/i18n.component';
import { CompanyService } from '../warehouse-layout/services/company.service';
import { WarehouseService } from '../warehouse-layout/services/warehouse.service';

@Component({
  selector: 'app-account-center',
  template: `
    <page-header [title]="'menu.account.center' | i18n" />
    <section class="mes-account">
      <div class="mes-account__intro">
        <div class="mes-account__avatar">{{ user.name?.charAt(0) || 'U' }}</div>
        <div>
          <h2>{{ user.name || 'User' }}</h2>
          <p>{{ user.email || ('web.dynamic.5b623554d3de' | i18n) }}</p>
        </div>
      </div>
      <div class="mes-account__grid">
        <article class="mes-account__card">
          <h3>{{ 'web.literal.d696a35bdd18' | i18n }}</h3>
          <dl>
            <div><dt>{{ 'web.literal.e3b89e9d33f8' | i18n }}</dt><dd>{{ user.name || '—' }}</dd></div>
            <div><dt>{{ 'web.literal.969ccbd3cf63' | i18n }}</dt><dd>{{ user.email || '—' }}</dd></div>
          </dl>
        </article>
        <article class="mes-account__card">
          <h3>{{ 'web.literal.184c749f9915' | i18n }}</h3>
          <dl>
            <div><dt>{{ 'web.literal.de4743c87973' | i18n }}</dt><dd>{{ companyName }}</dd></div>
            <div><dt>{{ 'web.literal.2a625c251683' | i18n }}</dt><dd>{{ warehouseName }}</dd></div>
          </dl>
        </article>
      </div>
      <a class="mes-account__link" routerLink="/pro/account/settings">{{ 'web.literal.b02dcff294c6' | i18n }}</a>
    </section>
  `,
  styleUrls: ['./account.component.less'],
  imports: [PageHeaderModule, I18nPipe, RouterLink]
})
export class AccountCenterComponent {
  private readonly settings = inject(SettingsService);
  private readonly companyService = inject(CompanyService);
  private readonly warehouseService = inject(WarehouseService);

  get user() {
    return this.settings.user;
  }

  get companyName(): string {
    return this.companyService.getCurrentCompany()?.name || '—';
  }

  get warehouseName(): string {
    return this.warehouseService.getCurrentWarehouse()?.name || '—';
  }
}

@Component({
  selector: 'app-account-settings',
  template: `
    <page-header [title]="'menu.account.settings' | i18n" />
    <section class="mes-account mes-account__grid">
      <article class="mes-account__card">
        <h3>{{ 'web.literal.11a045e402c3' | i18n }}</h3>
        <p>{{ 'web.literal.113387794638' | i18n }}</p>
        <div class="mes-account__control"><header-i18n /></div>
      </article>
      <article class="mes-account__card">
        <h3>{{ 'web.literal.184c749f9915' | i18n }}</h3>
        <dl>
          <div><dt>{{ 'web.literal.de4743c87973' | i18n }}</dt><dd>{{ companyName }}</dd></div>
          <div><dt>{{ 'web.literal.2a625c251683' | i18n }}</dt><dd>{{ warehouseName }}</dd></div>
        </dl>
        <p>{{ 'web.literal.a7e5fbc38409' | i18n }}</p>
      </article>
    </section>
  `,
  styleUrls: ['./account.component.less'],
  imports: [PageHeaderModule, I18nPipe, HeaderI18nComponent]
})
export class AccountSettingsComponent {
  private readonly companyService = inject(CompanyService);
  private readonly warehouseService = inject(WarehouseService);

  get companyName(): string {
    return this.companyService.getCurrentCompany()?.name || '—';
  }

  get warehouseName(): string {
    return this.warehouseService.getCurrentWarehouse()?.name || '—';
  }
}
