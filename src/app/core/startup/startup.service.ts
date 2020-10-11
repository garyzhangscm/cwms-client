import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService } from '@delon/theme';
import { TranslateService } from '@ngx-translate/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { I18NService } from '../i18n/i18n.service';

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private translate: TranslateService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    private httpClient: HttpClient,
    private injector: Injector, 
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private companyService: CompanyService,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  load(): Promise<void> {

    let siteInformationUrl = `resource/site-information`;

    if (!this.tokenService.get()?.token) {
      // If the user has not been login, get the default
      // site information

      siteInformationUrl = `${siteInformationUrl}/default`;
    } else {
      const currentDateTime = new Date().getTime();

      const expiredDateTime = new Date(this.tokenService.get()?.time);

      expiredDateTime.setSeconds(expiredDateTime.getSeconds() + this.tokenService.get()?.refreshIn);
      // expiredDateTime.setSeconds(expiredDateTime.getSeconds() + 10);

      if (currentDateTime >= expiredDateTime.getTime()) {
        console.log(`Login expired! current token was expired at ${expiredDateTime}`);
        // OK, the current authrization is already expired. let's go back to the login form
        // clear token and go back to the login form
        (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).clear();
        siteInformationUrl = `${siteInformationUrl}/default`;
        this.goToLoginForm();
      }
    }

    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve) => {
      zip(
        // this.httpClient.get(`assets/tmp/i18n/${this.i18n.defaultLang}.json`), 
        // this.httpClient.get('assets/tmp/app-data.json')
        this.httpClient.get(`resource/assets/i18n/${this.i18n.defaultLang}.json`),
        this.httpClient.get(siteInformationUrl), 
        )
        .pipe(
          // 接收其他拦截器后产生的异常消息
          catchError((res) => {
            console.warn(`StartupService.load: Network request failed`, res);
            resolve();
            return [];
          }),
        )
        .subscribe(
          ([langData, appData]) => {
            // setting language data
            this.translate.setTranslation(this.i18n.defaultLang, langData);
            this.translate.setDefaultLang(this.i18n.defaultLang);

            // application data
            const res = (appData as NzSafeAny).data; 
            // 应用信息：包括站点名、描述、年份
            this.settingService.setApp(res.app);
            // 用户信息：包括姓名、头像、邮箱地址
            this.settingService.setUser(res.user);
            // ACL：设置权限为全量
            this.aclService.setFull(true);
            // 初始化菜单 
            this.menuService.add(res.menu); 
            // 设置页面标题的后缀
            this.titleService.default = '';
            this.titleService.suffix = res.app.name;

            // setup the company information
            this.companyService.setSingleCompanyServerFlag(res.singleCompanySite);
            if (res.singleCompanySite === true) {
            this.companyService.setDefaultCompanyCode(res.defaultCompanyCode);
          } else {
            this.companyService.setDefaultCompanyCode('');
          }
          },
          () => {console.log(`error while loading infromation`);
                 (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).clear();
                 this.goToLoginForm();
        },
          () => {// if we are here, we probably get some error when try to load data
            // let's follow back to login form
            console.log(`finally while loading infromation`);
            
            resolve();
          },
        );
    });
  }


  private goToLoginForm() {
    // Before we go back to login form, we may need to at least load the langugue
    this.httpClient.get(`resource/assets/i18n/${this.i18n.defaultLang}.json`).subscribe(res => {
      // Setting language data
      this.translate.setTranslation(this.i18n.defaultLang, res);
      this.translate.setDefaultLang(this.i18n.defaultLang);
      setTimeout(() => this.injector.get(Router).navigateByUrl('/passport/login'));
    });
  }
}
