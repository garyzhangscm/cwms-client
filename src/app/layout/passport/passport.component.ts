import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFooterModule } from '@delon/abc/global-footer';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { ThemeBtnComponent } from '@delon/theme/theme-btn';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { HeaderI18nComponent } from '../basic/widgets/i18n.component';

@Component({
  selector: 'layout-passport',
  template: `
    <div class="container">
      <!--
      <header-i18n  showLangText="true" class="langs" /> 
-->
      <header-i18n  showLangText="true"   /> 
      <div class="wrap">
        <div class="top">
          <div class="head">
            <img class="logo" src="./assets/claytech_logo.png" />
            <span class="title">Claytech Suite</span>
          </div>
          <div class="desc"></div>
        </div>
        <router-outlet />
    <!--
        <global-footer [links]="links">
          Copyright
          <i class="anticon anticon-copyright"></i> 2023
          <a href="//github.com/cipchk" target="_blank">卡色</a>出品
        </global-footer>
    -->
        <global-footer>
          Copyright
          <i class="anticon-copyright"></i> 2020
          <a href="" target="_blank">claytech intl</a>
        </global-footer>
      </div>
    </div>
  `,
  styleUrls: ['./passport.component.less'],
  // imports: [RouterOutlet, HeaderI18nComponent, GlobalFooterModule, NzIconModule, ThemeBtnComponent]
  imports: [RouterOutlet, HeaderI18nComponent, GlobalFooterModule, NzIconModule]
})
export class LayoutPassportComponent implements OnInit {
  private tokenService = inject(DA_SERVICE_TOKEN);

  links = [
    {
      title: '帮助',
      href: ''
    },
    {
      title: '隐私',
      href: ''
    },
    {
      title: '条款',
      href: ''
    }
  ];

  ngOnInit(): void {
    this.tokenService.clear();
  }
}
