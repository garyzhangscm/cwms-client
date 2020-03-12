/**
 * 进一步对基础模块的导入提炼
 * 有关模块注册指导原则请参考：https://ng-alain.com/docs/module
 */
import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { throwIfAlreadyLoaded } from '@core';

import { AlainThemeModule } from '@delon/theme';
import { DelonACLModule } from '@delon/acl';

// #region mock
import { DelonMockModule } from '@delon/mock';
import * as MOCKDATA from '../../_mock';
import { environment } from '@env/environment';
const MOCK_MODULES = !environment.production ? [DelonMockModule.forRoot({ data: MOCKDATA })] : [];
// #endregion

// #region reuse-tab
/**
 * 若需要[路由复用](https://ng-alain.com/components/reuse-tab)需要：
 * 1、增加 `REUSETAB_PROVIDES`
 * 2、在 `src/app/layout/default/default.component.html` 修改：
 *  ```html
 *  <section class="alain-default__content">
 *    <reuse-tab></reuse-tab>
 *    <router-outlet></router-outlet>
 *  </section>
 *  ```
 */
import { RouteReuseStrategy } from '@angular/router';
import { ReuseTabService, ReuseTabStrategy } from '@delon/abc/reuse-tab';
const REUSETAB_PROVIDES = [
  // {
  //   provide: RouteReuseStrategy,
  //   useClass: ReuseTabStrategy,
  //   deps: [ReuseTabService],
  // },
];
// #endregion

// #region global config functions

import { PageHeaderConfig } from '@delon/abc';
export function fnPageHeaderConfig(): PageHeaderConfig {
  return {
    ...new PageHeaderConfig(),
    homeI18n: 'home',
  };
}

import { DelonAuthConfig, DA_STORE_TOKEN, MemoryStore, SessionStorageStore } from '@delon/auth';
export function fnDelonAuthConfig(): DelonAuthConfig {
  return {
    ...new DelonAuthConfig(),
    token_send_key: 'Authorization',
    token_send_template: 'Bearer ${token}',
    login_url: '/passport/login',
    ignores: [
      /\/login/,
      /assets/,
      /passport/,
      /layout\/warehouses\/accessible\//,
      /resource\/site-information\/default/,
      /resource\/assets\/i18n\//,
    ],
  };
}

// tslint:disable-next-line: no-duplicate-imports
import { STConfig } from '@delon/abc';
export function fnSTConfig(): STConfig {
  return {
    ...new STConfig(),
    modal: { size: 'lg' },
  };
}

const GLOBAL_CONFIG_PROVIDES = [
  // TIPS：@delon/abc 有大量的全局配置信息，例如设置所有 `st` 的页码默认为 `20` 行
  { provide: STConfig, useFactory: fnSTConfig },
  { provide: PageHeaderConfig, useFactory: fnPageHeaderConfig },
  { provide: DelonAuthConfig, useFactory: fnDelonAuthConfig },
];

// #endregion

@NgModule({
  imports: [AlainThemeModule.forRoot(), DelonACLModule.forRoot(), ...MOCK_MODULES],
})
export class DelonModule {
  constructor(@Optional() @SkipSelf() parentModule: DelonModule) {
    throwIfAlreadyLoaded(parentModule, 'DelonModule');
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DelonModule,
      providers: [
        ...REUSETAB_PROVIDES,
        ...GLOBAL_CONFIG_PROVIDES,
        // useClass:
        // MemoryStorage: lost after close the tab(lost after refresh)
        // LocalStorageStore: saved until manually clear. DEFAULT option
        // SessionStorageStore: lost after close the broswer
        { provide: DA_STORE_TOKEN, useClass: SessionStorageStore },
      ],
    };
  }
}
