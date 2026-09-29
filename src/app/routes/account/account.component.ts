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
          <p>{{ user.email || 'No email available' }}</p>
        </div>
      </div>
      <div class="mes-account__grid">
        <article class="mes-account__card">
          <h3>Profile</h3>
          <dl>
            <div><dt>Username</dt><dd>{{ user.name || '—' }}</dd></div>
            <div><dt>Email</dt><dd>{{ user.email || '—' }}</dd></div>
          </dl>
        </article>
        <article class="mes-account__card">
          <h3>Current workspace</h3>
          <dl>
            <div><dt>Company</dt><dd>{{ companyName }}</dd></div>
            <div><dt>Warehouse</dt><dd>{{ warehouseName }}</dd></div>
          </dl>
        </article>
      </div>
      <a class="mes-account__link" routerLink="/pro/account/settings">Account settings →</a>
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
        <h3>Display language</h3>
        <p>Choose the language used by this browser.</p>
        <div class="mes-account__control"><header-i18n /></div>
      </article>
      <article class="mes-account__card">
        <h3>Current workspace</h3>
        <dl>
          <div><dt>Company</dt><dd>{{ companyName }}</dd></div>
          <div><dt>Warehouse</dt><dd>{{ warehouseName }}</dd></div>
        </dl>
        <p>Use the warehouse selector in the header to switch warehouses.</p>
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
