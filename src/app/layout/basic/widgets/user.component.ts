import { ChangeDetectionStrategy, Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService, User } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from 'src/app/routes/auth/services/user.service';

@Component({
  selector: 'header-user',
  template: `
    <div class="alain-default__nav-item d-flex align-items-center px-sm" nz-dropdown nzPlacement="bottomRight" [nzDropdownMenu]="userMenu">
      <nz-avatar [nzSrc]="user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
      {{ user.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">    
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          {{ 'menu.account.logout' | i18n }}
        </div>
        
        <div nz-menu-item (click)="openChangePasswordModal()">
          <i nz-icon nzType="key" class="mr-sm"></i>
          {{ 'menu.account.change-password' | i18n }}
        </div>
      </div>
    </nz-dropdown-menu>
    
    <ng-template #tplChangePasswordModalTitle>
      <span>{{ 'page.modal.change-password.header.title' | i18n}}</span>
    </ng-template>
    <ng-template #tplChangePasswordModalContent>
      <form nz-form [formGroup]="changePasswordRequestForm">
        <div nz-row [nzGutter]="24">
          <div nz-col [nzSpan]="12">
            <nz-form-item nzFlex>
              <nz-form-label [nzSpan]="8" nzFor="newPassword">
                {{ 'password' | i18n }}
              </nz-form-label>
              <nz-form-control [nzSpan]="16">
                <nz-input-group nzSize="large">
                  <input nz-input   type="password" formControlName="newPassword" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <div nz-row [nzGutter]="24">
          <div nz-col [nzSpan]="12">
            <nz-form-item nzFlex>
              <nz-form-label [nzSpan]="8" nzFor="confirmPassword">
                {{ 'password.confirm' | i18n }}
              </nz-form-label>
              <nz-form-control [nzSpan]="16">
                <nz-input-group nzSize="large">
                  <input nz-input type="password"  formControlName="confirmPassword" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div> 
        
      </form>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderUserComponent {
  
  changePasswordRequestForm!: FormGroup;
  changePasswordRequestModal!: NzModalRef;
  
  @ViewChild('tplChangePasswordModalTitle', { static: true })
  tplChangePasswordModalTitle!: TemplateRef<any>;
  @ViewChild('tplChangePasswordModalContent', { static: true })
  tplChangePasswordModalContent!: TemplateRef<any>;
  
  get user(): User {
    return this.settings.user;
  }

  constructor(private settings: SettingsService, 
    private router: Router, 
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private userService: UserService, 
    public msg: NzMessageService,    
    private fb: FormBuilder,
    private modalService: NzModalService,) { }

  logout(): void {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!);
  }

  openChangePasswordModal(
  ): void {
    
    this.changePasswordRequestForm = this.fb.group({
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
        
        if (this.changePasswordRequestForm.controls.newPassword.value === null ||
            this.changePasswordRequestForm.controls.confirmPassword.value === null) {
           this.msg.error(this.i18n.fanyi('password-is-empty'));
           return false;
        }
        if (this.changePasswordRequestForm.controls.newPassword.value !== 
            this.changePasswordRequestForm.controls.confirmPassword.value) {
           this.msg.error(this.i18n.fanyi('password-not-match'));
           return false;
        }
        this.changePassword( 
          this.changePasswordRequestForm.controls.newPassword.value
        );
        return true;
      },

      nzWidth: 1000,
    });
  }

  changePassword(newPassword: string) {
    this.userService.getUsers(this.userService.getCurrentUsername()).subscribe({
      next: (userInfoRes) => { 
        // we should only have one user returned
        if (userInfoRes.length === 1) {
          this.userService.changePassword(userInfoRes[0], newPassword).subscribe({
            next: () => this.msg.success(this.i18n.fanyi('password-changed'))
          })
        }
      },  
    })
 

  }
}
