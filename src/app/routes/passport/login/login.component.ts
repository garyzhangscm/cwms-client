import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject, ViewChild, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService, StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, SocialOpenType, SocialService } from '@delon/auth';
import { I18nPipe, SettingsService, _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { environment } from '@env/environment';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabChangeEvent, NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { finalize } from 'rxjs';
import {  NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';


import { NzMessageService } from 'ng-zorro-antd/message';
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { UserService } from '../../auth/services/user.service';
import { User } from '../../auth/models/user';
import { UnitService } from '../../common/services/unit.service';
import { ACLService } from '@delon/acl';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // RouterLink,
    ReactiveFormsModule,
    I18nPipe,
    NzCheckboxModule,
    NzTabsModule,
    NzAlertModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzToolTipModule,
    NzIconModule,
    NzAlertModule ,
    NzSelectModule, 
    CommonModule 
  ]
})
export class UserLoginComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);
  private readonly socialService = inject(SocialService);
  private readonly reuseTabService = inject(ReuseTabService, { optional: true });
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly startupSrv = inject(StartupService);
  private readonly http = inject(_HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  
  private readonly msg = inject(NzMessageService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly companyService = inject(CompanyService); 
  private readonly warehouseConfigurationService = inject(WarehouseConfigurationService);
  private readonly userService = inject(UserService); 
  private readonly unitService = inject(UnitService);
  private readonly aclService = inject(ACLService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NzModalService);
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  private notification = inject(NzNotificationService);

  form = this.formBuilder.nonNullable.group({
    companyCode: ['', [Validators.required, Validators.minLength(1)]],
    // userName: ['', [Validators.required, Validators.pattern(/^(admin|user)$/)]],
    // password: ['', [Validators.required, Validators.pattern(/^(ng\-alain\.com)$/)]],
    userName: [null, [Validators.required, Validators.minLength(1)]],
    password: [null, Validators.required],
    warehouseId: [{ value: '', disabled: true }, Validators.required],
    // mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
    // captcha: ['', [Validators.required]],
    remember: [true]
  });
  
  get companyCode(): AbstractControl {
    return this.form.controls.companyCode;
  }
  get userName(): AbstractControl {
    return this.form.controls.userName;
  }
  get password(): AbstractControl {
    return this.form.controls.password;
  }  
  get warehouseId(): AbstractControl {
    return this.form.controls.warehouseId;
  }

  error = '';
  type = 0;
  loading = false;
  
  singleCompanySystem = true;
  defaultCompanyCode = '';
  changePasswordRequestForm!: UntypedFormGroup;
  changePasswordRequestModal!: NzModalRef;
  
  warehouses: Warehouse[] | undefined;

  
  @ViewChild('tplChangePasswordModalTitle', { static: true })
  tplChangePasswordModalTitle!: TemplateRef<any>;
  @ViewChild('tplChangePasswordModalContent', { static: true })
  tplChangePasswordModalContent!: TemplateRef<any>;

  count = 0;
  interval$: any;

  switch({ index }: NzTabChangeEvent): void {
    this.type = index!;
  }
  
  ngOnInit(): void {
    
    this.singleCompanySystem = this.companyService.isSingleCompanyServer();
    if (this.singleCompanySystem === true) {
      this.defaultCompanyCode = this.companyService.getDefaultCompanyCode()!;
      this.form.controls.companyCode.setValue(this.defaultCompanyCode);
      this.form.controls.companyCode.disable();
    } else {
      this.defaultCompanyCode = '';
      this.form.controls.companyCode.enable();

      this.form.controls.companyCode.setValue(this.companyService.getCurrentCompany()?.code == undefined ?
           "" : this.companyService.getCurrentCompany()!.code);

    } 
  }

/** 
 * 
  getCaptcha(): void {
    const mobile = this.form.controls.mobile;
    if (mobile.invalid) {
      mobile.markAsDirty({ onlySelf: true });
      mobile.updateValueAndValidity({ onlySelf: true });
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

 */

  submit(): void {
    this.error = '';
    
    
    /**
     * 
    if (this.type === 0) {
      const { userName, password } = this.form.controls;
      userName.markAsDirty();
      userName.updateValueAndValidity();
      password.markAsDirty();
      password.updateValueAndValidity();
      if (userName.invalid || password.invalid) {
        return;
      }
    } else {
      const { mobile, captcha } = this.form.controls;
      mobile.markAsDirty();
      mobile.updateValueAndValidity();
      captcha.markAsDirty();
      captcha.updateValueAndValidity();
      if (mobile.invalid || captcha.invalid) {
        return;
      }
    }
     * 
     */
    
    const { userName, password } = this.form.controls;
    userName.markAsDirty();
    userName.updateValueAndValidity();
    password.markAsDirty();
    password.updateValueAndValidity();
    if (userName.invalid || password.invalid) {
      return;
    }

    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此加上 `ALLOW_ANONYMOUS` 表示不触发用户 Token 校验
    this.loading = true;
    const loginURL = `auth/login`;

    this.cdr.detectChanges();
    this.http
      .post(
        // '/login/account',
        loginURL,
        {
          type: this.type,
          companyId: this.companyService.getCurrentCompany()?.id,
          loginWarehouseId: this.warehouseId.value,
          //userName: this.form.value.userName,
          username: this.form.value.userName,
          password: this.form.value.password
        },
        null,
        {
          context: new HttpContext().set(ALLOW_ANONYMOUS, true)
        }
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(res => {
        
        if (res.result !== 0) {
          this.error = res.msg;
          
          this.notification.error(`${res.result}`, this.i18n.fanyi(res.msg));
          this.cdr.detectChanges();
          return; 
        }
 
        // 清空路由复用信息
        this.reuseTabService?.clear();
        // 设置用户Token信息
        // TODO: Mock expired value
        res.user.expired = +new Date() + 1000 * 60 * 5;
        this.tokenService.set(res.user);
        

        this.reloadInfoAfterSuccessfullyLogin(res);

        

        // get the company information
        
        /**
         * 
        this.companyService.getCompanies(this.companyCode.value).subscribe(companiesRes => {
          console.log(`company res length: ${companiesRes.length}`);
          if (companiesRes.length === 1) {
            this.companyService.setCurrentCompany(companiesRes[0]);
          }
        });
        */


        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        /**
         * 
        this.startupSrv.load().subscribe(() => {
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

  reloadInfoAfterSuccessfullyLogin(loginRes: any) : void {

        // get the company information
        this.companyService.getCompanies(this.companyCode.value).subscribe(companiesRes => {
          // console.log(`1. company res length: ${companiesRes.length}`);
          if (companiesRes.length === 1) {
            this.companyService.setCurrentCompany(companiesRes[0]);
            
            this.warehouseService.getWarehouse(this.warehouseId.value).subscribe((warehouse: Warehouse) => {
              this.warehouseService.setCurrentWarehouse(warehouse);
              // setup the warehouse's time zone
              this.warehouseConfigurationService.getWarehouseConfiguration(true, warehouse.id).subscribe({
                next: (warehouseConfigurationRes) => {
                  warehouse.timeZone = warehouseConfigurationRes.timeZone;
                  this.warehouseService.setCurrentWarehouse(warehouse);

                }, 
                error: () => {
                  var date = new Date(); 
                  var timezone = date.getTimezoneOffset();
                  warehouse.timeZone = timezone.toString();
                  this.warehouseService.setCurrentWarehouse(warehouse);
                }
              })
              // setup the current user
              this.userService.setupCurrentUser();
              // setup caches
              this.setupCaches();
              // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
              this.startupSrv.load(warehouse.id).subscribe(() => {
                /***
                 * 
                let url = this.tokenService.referrer!.url || '/';
                if (url.includes('/passport')) {
                  url = '/';
                }
                this.router.navigateByUrl(url);
                * 
                */
                // before we flow into the main page, let's check if the user need to change the password 
                 
                this.userService.getUsers(loginRes.user.name).subscribe({
                  next: (userInfoRes) => {
                    if (userInfoRes.length === 1) {
                      // setup the ACL controller to full is the user is system admin or admin
                      if (userInfoRes[0].systemAdmin || userInfoRes[0].admin) {
                        this.aclService.setFull(true);
                      }
                      else {
                        // for non admin user, we will setup the ACL based on the menu access
                        this.aclService.setFull(false);
                      }

                      if (userInfoRes[0].changePasswordAtNextLogon === true) {
                        // force the user to change the password before continue
                        this.openChangePasswordModal(userInfoRes[0]);
      
                      }
                      else {
                        this.router.navigateByUrl('/');
      
                      }
                    }
                    else {
                      this.router.navigateByUrl('/')
                    }
                  }, 
                  error: () => this.router.navigateByUrl('/')
                })
              });
            });
          }
        });
        

  }

  open(type: string, openType: SocialOpenType = 'href'): void {
    let url = ``;
    let callback = ``;
    if (environment.production) {
      callback = `https://ng-alain.github.io/ng-alain/#/passport/callback/${type}`;
    } else {
      callback = `http://localhost:4200/#/passport/callback/${type}`;
    }
    switch (type) {
      case 'auth0':
        url = `//cipchk.auth0.com/login?client=8gcNydIDzGBYxzqV0Vm1CX_RXH-wsWo5&redirect_uri=${decodeURIComponent(callback)}`;
        break;
      case 'github':
        url = `//github.com/login/oauth/authorize?client_id=9d6baae4b04a23fcafa2&response_type=code&redirect_uri=${decodeURIComponent(
          callback
        )}`;
        break;
      case 'weibo':
        url = `https://api.weibo.com/oauth2/authorize?client_id=1239507802&response_type=code&redirect_uri=${decodeURIComponent(callback)}`;
        break;
    }
    if (openType === 'window') {
      this.socialService
        .login(url, '/', {
          type: 'window'
        })
        .subscribe(res => {
          if (res) {
            this.settingsService.setUser(res);
            this.router.navigateByUrl('/');
          }
        });
    } else {
      this.socialService.login(url, '/', {
        type: 'href'
      });
    }
  }

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
  
  onCompanyCodeBlur(): void {
    // load the company
    console.log(`start to login with company code: ${this.companyCode.value}`);
    this.companyService.validateCompanyCode(this.companyCode.value).subscribe(companyId => {
      if (companyId) {
        this.companyService.setCurrentCompany({
          id: companyId,
          code: this.companyCode.value,
          name: this.companyCode.value,
          description: this.companyCode.value,
          contactorFirstname: '',
          contactorLastname: '',
          addressCountry: '',
          addressState: '',
          addressCounty: '',
          addressCity: '',
          addressDistrict: '',
          addressLine1: '',
          addressLine2: '',
          addressPostcode: '',
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

  
  openChangePasswordModal(
    // tplChangePasswordModalTitle: TemplateRef<{}>,
    // tplChangePasswordModalContent: TemplateRef<{}>,
    user: User
  ): void {
    
    this.changePasswordRequestForm = this.formBuilder.nonNullable.group({
      newPassword: [null],
      confirmPassword: [null],
    });

    // Load the location
    this.changePasswordRequestModal = this.modalService.create({
      nzTitle: this.tplChangePasswordModalTitle,
      nzContent: this.tplChangePasswordModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.changePasswordRequestModal.destroy();
      },
      nzOnOk: () => {
        
        if (this.changePasswordRequestForm.value.newPassword === null ||
            this.changePasswordRequestForm.value.confirmPassword === null) {
           this.msg.error(this.i18n.fanyi('password-is-empty'));
           return false;
        }
        if (this.changePasswordRequestForm.value.newPassword !== 
            this.changePasswordRequestForm.value.confirmPassword) {
           this.msg.error(this.i18n.fanyi('password-not-match'));
           return false;
        }
        this.changePassword( 
          user,
          this.changePasswordRequestForm.value.newPassword
        );
        return true;
      },

      nzWidth: 1000,
    });
  }

  
  changePassword(user: User, newPassword: string) {
    
    this.userService.changePassword(user, newPassword).subscribe({
      next: () => this.router.navigateByUrl('/')
      
    })

  }
  
  setupCaches() {
    this.unitService.loadUnits(true);

  }
}
