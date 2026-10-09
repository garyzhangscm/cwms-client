import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, booleanAttribute, inject } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, I18nPipe, SettingsService } from '@delon/theme';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'header-i18n',
  template: `
    <button type="button" class="language-trigger" [class.language-trigger--icon]="!showLangText"
      nz-dropdown [nzDropdownMenu]="langMenu" nzTrigger="click" nzPlacement="bottomRight"
      [(nzVisible)]="menuOpen" (keydown.escape)="menuOpen = false" aria-haspopup="menu" [attr.aria-expanded]="menuOpen"
      [attr.aria-label]="('menu.lang' | i18n) + ': ' + currentLanguageText">
      <i nz-icon nzType="global"></i>
      @if (showLangText) {
        <span>{{ currentLanguageText }}</span>
        <i class="language-chevron" nz-icon nzType="down"></i>
      }
    </button>
    <nz-dropdown-menu #langMenu="nzDropdownMenu">
      <ul nz-menu class="language-menu">
        @for (item of langs; track $index) {
          <li nz-menu-item [nzSelected]="item.code === curLangCode" (click)="change(item.code)">
            <span class="language-option">
              <span class="language-option__text">{{ item.text }}</span>
              @if (item.code === curLangCode) {
                <i nz-icon nzType="check" aria-hidden="true"></i>
              }
            </span>
          </li>
        }
      </ul>
    </nz-dropdown-menu>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; }
    .language-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      height: 38px;
      padding: 0 13px;
      border: 1px solid rgba(119, 141, 178, .22);
      border-radius: 12px;
      color: var(--mes-ink, #24324a);
      background: var(--mes-surface, rgba(255, 255, 255, .8));
      box-shadow: 0 2px 8px rgba(35, 54, 88, .04);
      font: inherit;
      font-size: 13px;
      font-weight: 550;
      line-height: 1;
      cursor: pointer;
      transition: background-color 160ms ease, border-color 160ms ease;
    }
    .language-trigger:hover {
      border-color: #93b6ee;
      background: var(--mes-hover, #f4f8ff);
    }
    .language-trigger:focus-visible { outline: 2px solid #3478f6; outline-offset: 3px; }
    .language-trigger .anticon { margin: 0; font-size: 16px; }
    .language-trigger .language-chevron { font-size: 10px; color: var(--mes-muted, #6b7890); }
    .language-trigger--icon { width: 34px; padding: 0; }
    .language-menu {
      width: 196px;
      max-width: calc(100vw - 32px);
      padding: 6px;
      border-radius: 14px;
      background: var(--mes-surface, #fff);
      box-shadow: 0 12px 32px rgba(26, 42, 69, .14);
    }
    .language-menu .ant-dropdown-menu-item {
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 40px;
      padding: 8px 12px;
      border-radius: 8px;
      color: var(--mes-ink, #24324a);
      font-size: 14px;
    }
    .language-option { display: flex; align-items: center; gap: 16px; width: 100%; }
    .language-option__text { flex: 1; }
    .language-menu .ant-dropdown-menu-item-selected {
      color: var(--mes-blue, #2864dd);
      background: var(--mes-blue-soft, #edf3ff);
    }
    .language-menu .ant-dropdown-menu-item:hover { background: var(--mes-hover, #f4f8ff); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [I18nPipe, NzDropDownModule, NzIconModule, NzMenuModule]
})
export class HeaderI18nComponent {
  menuOpen = false;
  private readonly settings = inject(SettingsService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly doc = inject(DOCUMENT);
  /** Whether to display language text */
  @Input({ transform: booleanAttribute }) showLangText = true;

  get langs(): Array<{ code: string; text: string; abbr: string }> {
    return this.i18n.getLangs().filter(item => item.code !== 'zh-TW');
  }

  get curLangCode(): string {
    return this.settings.layout.lang || this.i18n.currentLang || this.i18n.defaultLang;
  }

  get currentLanguageText(): string {
    return this.langs.find(item => item.code === this.curLangCode)?.text ?? 'Language';
  }

  change(lang: string): void {
    if (lang === this.curLangCode) return;
    const spinEl = this.doc.createElement('div');
    spinEl.setAttribute('class', `page-loading ant-spin ant-spin-lg ant-spin-spinning`);
    spinEl.innerHTML = `<span class="ant-spin-dot ant-spin-dot-spin"><i></i><i></i><i></i><i></i></span>`;
    this.doc.body.appendChild(spinEl);

    this.i18n.loadLangData(lang).subscribe(res => {
      this.i18n.use(lang, res);
      this.settings.setLayout('lang', lang);
      setTimeout(() => this.doc.location.reload());
    });
  }
}
