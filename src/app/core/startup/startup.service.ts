import { APP_INITIALIZER, Injectable, Provider, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { ALAIN_I18N_TOKEN, Menu, MenuService, SettingsService, TitleService } from '@delon/theme';
import { ACLService } from '@delon/acl';
import { I18NService } from '../i18n/i18n.service';
import { Observable, zip, of, catchError, map } from 'rxjs';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';

import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';
import { WebClientConfigurationService } from 'src/app/routes/util/services/web-client-configuration.service';
import { UserService } from 'src/app/routes/auth/services/user.service';
import { NzIconService } from 'ng-zorro-antd/icon';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { ICONS } from '../../../style-icons';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
export function provideStartup(): Provider[] {
  return [
    StartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ];
}

@Injectable()
export class StartupService {
  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private tokenService = inject(DA_SERVICE_TOKEN);
  private aclService = inject(ACLService);
  private titleService = inject(TitleService);
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  private companyService = inject(CompanyService);
  private warehouseService = inject(WarehouseService);
  private webClientConfigurationService = inject(WebClientConfigurationService);
  private userService = inject(UserService);

  // If http request allows anonymous access, you need to add `ALLOW_ANONYMOUS`:
  // this.httpClient.get('/app', { context: new HttpContext().set(ALLOW_ANONYMOUS, true) })
  // private appData$ = this.httpClient.get('./assets/tmp/app-data.json').pipe(
  private appData$ = this.httpClient.get('./resource/assets/app-data.json').pipe(
    catchError((res: NzSafeAny) => {
      console.warn(`StartupService.load: Network request failed`, res);
      setTimeout(() => this.router.navigateByUrl(`/exception/500`));
      return of({});
    })
  );
  
  constructor(iconSrv: NzIconService) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  private handleAppData(res: NzSafeAny): void {
    // Application information: including site name, description, year
    this.settingService.setApp(res.app);
    // User information: including name, avatar, email address
    this.settingService.setUser(res.user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add(res.menu ?? []);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = res.app?.name;
  }

  
  private viaHttp(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    return zip(this.i18n.loadLangData(defaultLang), this.appData$).pipe(
      map(([langData, appData]: [Record<string, string>, NzSafeAny]) => {
        // setting language data
        this.i18n.use(defaultLang, langData);

        this.handleAppData(appData);
      })
    );
  }
  

  
  private viaMockI18n(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    return this.i18n.loadLangData(defaultLang).pipe(
        map((langData: NzSafeAny) => {
          this.i18n.use(defaultLang, langData);

          this.viaMock();
        })
      );
  }
  
  private viaMock(): Observable<void> {
    // const tokenData = this.tokenService.get();
    // if (!tokenData.token) {
    //   this.router.navigateByUrl(this.tokenService.login_url!);
    //   return;
    // }
    // mock
    const app: any = {
      name: `NG-ALAIN`,
      description: `NG-ZORRO admin panel front-end framework`
    };
    const user: any = {
      name: 'Admin',
      avatar: './assets/tmp/img/avatar.jpg',
      email: 'cipchk@qq.com',
      token: '123456789'
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);
    // User information: including name, avatar, email address
    this.settingService.setUser(user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add([
      {
        text: 'Main',
        group: true,
        children: [
          {
            text: 'Dashboard',
            link: '/dashboard',
            icon: { type: 'icon', value: 'appstore' }
          }
        ]
      }
    ]);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = app.name;

    return of(void 0);
  }

  load(warehouseId?: number): Observable<void> {
    // http
    // return this.viaHttp();
    // mock: Don’t use it in a production environment. ViaMock is just to simulate some data to make the scaffolding work normally
    // mock：请勿在生产环境中这么使用，viaMock 单纯只是为了模拟一些数据使脚手架一开始能正常运行
    // return this.viaMockI18n();
    let siteInformationUrl = `resource/site-information`;
    
    if (!this.tokenService.get()?.token) {
      // If the user has not been login, get the default
      // site information

      siteInformationUrl = `${siteInformationUrl}/default`;
    } else {
      const currentDateTime = new Date().getTime();


      const expiredDateTime = new Date(this.tokenService.get()?.expired!);

      if (currentDateTime >= expiredDateTime.getTime()) {
        // OK, the current authrization is already expired. let's go back to the login form
        // clear token and go back to the login form
        this.tokenService.clear();
        siteInformationUrl = `${siteInformationUrl}/default`;
        this.goToLoginForm();
      }
    }
    siteInformationUrl = `${siteInformationUrl}?companyId=${this.companyService.getCurrentCompany()?.id}`;
    if (warehouseId) {
      siteInformationUrl = `${siteInformationUrl}&warehouseId=${warehouseId}`;
    }
    else if (this.warehouseService.getCurrentWarehouse() != null) {
      siteInformationUrl = `${siteInformationUrl}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    } 

    const defaultLang = this.i18n.defaultLang;
    return zip(
      this.i18n.loadLangData(defaultLang),
      // this.httpClient.get('assets/tmp/app-data.json')
      //this.httpClient.get(`resource/assets/i18n/${this.i18n.defaultLang}.json`),
      this.httpClient.get(siteInformationUrl),
    ).pipe(
      // 接收其他拦截器后产生的异常消息
      catchError(res => {
        console.warn(`StartupService.load: Network request failed`, res);
        return [];
      }),
      map(([langData, appData]: [Record<string, string>, NzSafeAny]) => {
        // setting language data
        this.i18n.use(defaultLang, langData);

        // application data
        const res = (appData as NzSafeAny).data;
        // 应用信息：包括站点名、描述、年份
        this.settingService.setApp(res.app);
        // 用户信息：包括姓名、头像、邮箱地址
        this.settingService.setUser(res.user);
        // ACL：设置权限为全量
        // this.aclService.setFull(true);

        // 初始化菜单 
        this.menuService.add(res.menu);
        // setup the ACL based on the user's accessible menu
        // console.log(`this.tokenService.get(): ${this.tokenService.get()?.token}, expired? ${this.tokenService.get()?.expired}`); 
        if (this.tokenService.get()?.token != null) {

            // we will only need to setup the ACL if the user is already login
            this.setupMenuBasedACL(res.menu);

            // setup the admin role
            this.userService.getCurrentUser().then(
              user => {
                if (user != null && user.admin) {
                  this.aclService.attachRole(['admin']);
                }
                if (user != null && user.systemAdmin) {
                  this.aclService.attachRole(['system-admin']);
                }
              }
            )
        }

        // 设置页面标题的后缀
        this.titleService.default = '';
        this.titleService.suffix = res.app.name;

        // console.log(`res.webClientConfiguration: ${JSON.stringify(res.webClientConfiguration)}`);
        this.webClientConfigurationService.setWebClientConfiguration(res.webClientConfiguration);

        // setup the company information
        this.companyService.setSingleCompanyServerFlag(res.singleCompanySite);
        if (res.singleCompanySite === true) {
          this.companyService.setDefaultCompanyCode(res.defaultCompanyCode);
        } else {
          this.companyService.setDefaultCompanyCode('');
        }
        this.warehouseService.setServerSidePrintingFlag(res.serverSidePrinting);

      },
        () => {
          console.log(`error while loading infromation`);
          (this.tokenService).clear();
          this.goToLoginForm();
        })
    );
  }

  
  private goToLoginForm() {
    // Before we go back to login form, we may need to at least load the langugue
    this.httpClient.get(`resource/assets/i18n/${this.i18n.defaultLang}.json`).subscribe(res => {
      // Setting language data
      // this.translate.setTranslation(this.i18n.defaultLang, res);
      // this.translate.setDefaultLang(this.i18n.defaultLang);
      setTimeout(() => this.router.navigateByUrl('/passport/login'));
    });
  }

  
  setupMenuBasedACL(accessibleMenu : Menu[]) {

    accessibleMenu.forEach(
      menu => {
        if (menu.children && menu.children.length > 0) {
          this.setupMenuBasedACL(menu.children);
        }
        if (menu.link && menu.link.length > 0) {
          this.aclService.attachRole([menu.link]);
        }

      }
    ) 
    
  }
}
