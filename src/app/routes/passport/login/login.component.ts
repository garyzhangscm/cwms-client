import { Component, Inject, Injector, OnDestroy, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService, StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { DA_SERVICE_TOKEN, ITokenService, SocialOpenType, SocialService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
})
export class UserLoginComponent implements OnDestroy {
  singleCompanySystem = true;
  defaultCompanyCode = '';

  constructor(
    fb: FormBuilder,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private i18n: I18NService,
    private injector: Injector,
  ) {
    this.form = fb.group({
      companyCode: [null, [Validators.required, Validators.minLength(1)]],
      // userName: [null, [Validators.required, Validators.pattern(/^(admin|user)$/)]],
      // password: [null, [Validators.required, Validators.pattern(/^(ng\-alain\.com)$/)]],
      userName: [null, [Validators.required, Validators.minLength(1)]],
      password: [null, Validators.required],
      warehouseId: [{ value: '', disabled: true }, Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required]],
      remember: [true],
    });
  }

  // #region fields
  get companyCode(): AbstractControl{
    return this.form.controls.companyCode;
  }
  get userName(): AbstractControl {
    return this.form.controls.userName;
  }
  get password(): AbstractControl {
    return this.form.controls.password;
  }
  get mobile(): AbstractControl {
    return this.form.controls.mobile;
  }
  get captcha(): AbstractControl {
    return this.form.controls.captcha;
  }
  get warehouseId(): AbstractControl{
    return this.form.controls.warehouseId;
  }
  form: FormGroup;
  error = '';
  type = 0;

  // #region get captcha

  count = 0;
  interval$: any;
  warehouses: Warehouse[] | undefined;

  // #endregion
  ngOnInit(): void {
    this.singleCompanySystem = this.companyService.isSingleCompanyServer();
    if (this.singleCompanySystem === true) {
      this.defaultCompanyCode = this.companyService.getDefaultCompanyCode()!;
      this.form.controls.companyCode.setValue(this.defaultCompanyCode);
      this.form.controls.companyCode.disable();
    } else {
      this.defaultCompanyCode = '';
      this.form.controls.companyCode.enable(); 

        this.form.controls.companyCode.setValue(this.companyService.getCurrentCompany()?.code);
       
    }
  }
  
  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  switch({ index }: { index: number }): void {
    this.type = index;
  }

  getCaptcha(): void {
    if (this.mobile.invalid) {
      this.mobile.markAsDirty({ onlySelf: true });
      this.mobile.updateValueAndValidity({ onlySelf: true });
      return;
    }
    this.count = 59;
    this.interval$ = setInterval(() => {
      this.count -= 1;
      if (this.count <= 0) {
        clearInterval(this.interval$);
      }
    }, 1000);
  }

  // #endregion

  submit(): void {
    this.error = '';
    if (this.type === 0) {
      this.userName.markAsDirty();
      this.userName.updateValueAndValidity();
      this.password.markAsDirty();
      this.password.updateValueAndValidity();
      if (this.userName.invalid || this.password.invalid) {
        return;
      }
    } else {
      this.mobile.markAsDirty();
      this.mobile.updateValueAndValidity();
      this.captcha.markAsDirty();
      this.captcha.updateValueAndValidity();
      if (this.mobile.invalid || this.captcha.invalid) {
        return;
      }
    }

    // dev / aws-dev / etc
    const loginURL = `auth/login?_allow_anonymous=true`;

    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
    this.http
      .post(loginURL, {
        type: this.type,
        companyId: this.companyService.getCurrentCompany()?.id,
        userName: this.userName.value,
        username: this.userName.value,
        password: this.password.value,
      })
      .subscribe((res) => {
        if (res.result !== 0) {
          this.error = res.msg;
          console.log(`we got error: ${res.msg}`); ;
          this.notification.error(`${res.result}`, this.i18n.fanyi(res.msg));
          return;
        }
        // 清空路由复用信息
        this.reuseTabService.clear();
        // 设置用户Token信息
        // TODO: Mock expired value
        res.user.expired = +new Date() + 1000 * 60 * 1000;
        this.tokenService.set(res.user);

        // get the company information
        this.companyService.getCompanies(this.companyCode.value).subscribe(companiesRes => {
          console.log(`company res length: ${companiesRes.length}`);
          if (companiesRes.length === 1) { 
            this.companyService.setCurrentCompany(companiesRes[0]);
          }
        });

        this.warehouseService.getWarehouse(this.warehouseId.value).subscribe((warehouse: Warehouse) => {
          this.warehouseService.setCurrentWarehouse(warehouse);
          // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
          this.startupSrv.load(warehouse.id).then(() => {
            /***
             * 
            let url = this.tokenService.referrer!.url || '/';
            if (url.includes('/passport')) {
              url = '/';
            }
            this.router.navigateByUrl(url);
             * 
             */
            this.router.navigateByUrl('/');
          });
        });

        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        /***
         * 
        this.startupSrv.load().then(() => {
          let url = this.tokenService.referrer!.url || '/';
          if (url.includes('/passport')) {
            url = '/';
          }
          this.router.navigateByUrl(url);
        });
         * 
         */
      });
  }

  // #region social

  open(type: string, openType: SocialOpenType = 'href'): void {
    let url = ``;
    let callback = ``;
    // tslint:disable-next-line: prefer-conditional-expression
    if (environment.production) {
      callback = 'https://ng-alain.github.io/ng-alain/#/callback/' + type;
    } else {
      callback = 'http://localhost:4200/#/callback/' + type;
    }
    switch (type) {
      case 'auth0':
        url = `//cipchk.auth0.com/login?client=8gcNydIDzGBYxzqV0Vm1CX_RXH-wsWo5&redirect_uri=${decodeURIComponent(callback)}`;
        break;
      case 'github':
        url = `//github.com/login/oauth/authorize?client_id=9d6baae4b04a23fcafa2&response_type=code&redirect_uri=${decodeURIComponent(
          callback,
        )}`;
        break;
      case 'weibo':
        url = `https://api.weibo.com/oauth2/authorize?client_id=1239507802&response_type=code&redirect_uri=${decodeURIComponent(callback)}`;
        break;
    }
    if (openType === 'window') {
      this.socialService
        .login(url, '/', {
          type: 'window',
        })
        .subscribe((res) => {
          if (res) {
            this.settingsService.setUser(res);
            this.router.navigateByUrl('/');
          }
        });
    } else {
      this.socialService.login(url, '/', {
        type: 'href',
      });
    }
  }
  onCompanyCodeBlur(): void{
    // load the company
    this.companyService.validateCompanyCode(this.companyCode.value).subscribe(companyId => {
      if (companyId) {
        this.companyService.setCurrentCompany({
          id: companyId,
          code: this.companyCode.value,
          name: this.companyCode.value,
          description: this.companyCode.value,
          contactorFirstname: '',
          contactorLastname:  '',
          addressCountry:  '',
          addressState:  '',
          addressCounty:  '',
          addressCity:  '',
          addressDistrict: '',
          addressLine1:  '',
          addressLine2:  '',
          addressPostcode:  '',
        })
        
      //  this.companyService.setCurrentCompany(this.companyCode.value);
      }
      else {
          // the command code is not a valid company code
          console.log(`company code ${this.companyCode.value} is wrong`)
      }

    });

    // Load all valid warehouses in this company, assigned to the user
    this.loadWarehouses();
  }
  loadWarehouses(): void {
    console.log(`Start to load warehouse ${this.userName.value}`);
    if (this.userName.value === '' || this.companyCode.value === '') {
      this.warehouses = [];
      this.warehouseId.disable();
    } else {
      this.warehouseService
        .getWarehouseByUser(this.companyCode.value, this.userName.value)
        .subscribe((warehouses: Warehouse[]) => {
          this.warehouses = warehouses;
          if (warehouses.length >= 1) {
            this.warehouseId.setValue(warehouses[0].id);
          }
          warehouses.length > 1 ? this.warehouseId.enable() : this.warehouseId.disable();
        });
    }
  }

  // #endregion

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
