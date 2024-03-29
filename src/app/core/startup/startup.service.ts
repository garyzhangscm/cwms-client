import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService, ACLType } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, Menu, MenuService, SettingsService, TitleService } from '@delon/theme';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';
import { Observable, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from 'src/app/routes/auth/services/user.service';
import { WebClientConfigurationService } from 'src/app/routes/util/services/web-client-configuration.service';
import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { I18NService } from '../i18n/i18n.service';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    private httpClient: HttpClient,
    private injector: Injector,
    private companyService: CompanyService,
    private userService: UserService,
    // private translate: TranslateService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private webClientConfigurationService: WebClientConfigurationService,
    private warehouseService: WarehouseService,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  load(warehouseId?: number): Observable<void> {


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
        (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).clear();
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
          (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).clear();
          this.goToLoginForm();
        })
    );
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

    // add admin role and system admin role if the current 
    // user is admin or system admin
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

  private goToLoginForm() {
    // Before we go back to login form, we may need to at least load the langugue
    this.httpClient.get(`resource/assets/i18n/${this.i18n.defaultLang}.json`).subscribe(res => {
      // Setting language data
      // this.translate.setTranslation(this.i18n.defaultLang, res);
      // this.translate.setDefaultLang(this.i18n.defaultLang);
      setTimeout(() => this.injector.get(Router).navigateByUrl('/passport/login'));
    });
  }

  
}
