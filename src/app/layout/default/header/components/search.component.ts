import { Component, HostBinding, Input, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MenuService, Menu } from '@delon/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'header-search',
  template: `
    <nz-input-group [nzAddOnBeforeIcon]="focus ? 'arrow-down' : 'search'">
      <input
        nz-input
        [(ngModel)]="q"
        (focus)="qFocus()"
        (blur)="qBlur()"
        [placeholder]="'menu.search.placeholder' | translate"
        (ngModelChange)="onChange($event)"
        [nzAutocomplete]="auto"
      />
      <nz-autocomplete #auto>
        <nz-auto-option class="global-search-item" *ngFor="let menu of filteredMenus" [nzValue]="menu.text">
          <a class="global-search-item-desc" (click)="openMenu(menu)" rel="noopener noreferrer">
            {{ menu.text }}
          </a>
        </nz-auto-option>
      </nz-autocomplete>
    </nz-input-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderSearchComponent implements AfterViewInit {
  q: string;

  qIpt: HTMLInputElement;
  filteredMenus: Menu[] = [];

  @HostBinding('class.alain-default__search-focus')
  focus = false;

  @HostBinding('class.alain-default__search-toggled')
  searchToggled = false;

  @Input()
  set toggleChange(value: boolean) {
    if (typeof value === 'undefined') return;
    this.searchToggled = true;
    this.focus = true;
    setTimeout(() => this.qIpt.focus(), 300);
  }

  constructor(private el: ElementRef, private menuService: MenuService, private router: Router) {}

  ngAfterViewInit() {
    this.qIpt = (this.el.nativeElement as HTMLElement).querySelector('.ant-input') as HTMLInputElement;
  }

  qFocus() {
    this.focus = true;
  }

  qBlur() {
    this.focus = false;
    this.searchToggled = false;
  }

  onChange(value: string): void {
    this.filteredMenus = [];
    // console.log(`Start to list from menu \n ${JSON.stringify(this.menuService.menus)} \n ${value}`);
    this.menuService.menus.forEach(menu => {
      this.addFilterMenu(value, menu);
    });
  }

  addFilterMenu(value: string, menu: Menu) {
    if (menu.text.includes(value) && menu.link) {
      // console.log(`### added menu \n ${menu.text} - ${menu.link}`);
      this.filteredMenus.push(menu);
    }
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(childMenu => {
        this.addFilterMenu(value, childMenu);
      });
    }
  }
  openMenu(menu: Menu) {
    console.log(`start to navigate to ${menu.link}`);
    this.router.navigateByUrl(menu.link);
  }
}
