import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, Menu, MenuService } from '@delon/theme';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators'; 

interface MenuItem{
  name: string;
  url: string;
}


@Component({
  selector: 'header-search',
  template: `
    <nz-input-group [nzPrefix]="iconTpl" [nzSuffix]="loadingTpl">
      <ng-template #iconTpl>
        <i nz-icon [nzType]="focus ? 'arrow-down' : 'search'"></i>
      </ng-template>
      <ng-template #loadingTpl>
        <i *ngIf="loading" nz-icon nzType="loading"></i>
      </ng-template>
      <input
        type="text"
        nz-input
        [(ngModel)]="q"
        [nzAutocomplete]="auto"
        (input)="search($event)"
        (focus)="qFocus()"
        (blur)="qBlur()"
       
        [attr.placeholder]="'menu.search.placeholder' | i18n"
      />
    </nz-input-group>
    <nz-autocomplete #auto >
      <nz-auto-option *ngFor="let menuItem of options" [nzValue]="menuItem.name" (selectionChange)="optionSelectedChanged($event, menuItem)" >
        <a>{{ menuItem.name }}</a></nz-auto-option>
    </nz-autocomplete>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSearchComponent implements AfterViewInit, OnDestroy {
  q = '';
  qIpt: HTMLInputElement | null = null;
  options: MenuItem[] = [];
  search$ = new BehaviorSubject('');
  loading = false;

  @HostBinding('class.alain-default__search-focus')
  focus = false;
  @HostBinding('class.alain-default__search-toggled')
  searchToggled = false;

  @Input()
  set toggleChange(value: boolean) {
    if (typeof value === 'undefined') {
      return;
    }
    this.searchToggled = value;
    this.focus = value;
    if (value) {
      setTimeout(() => this.qIpt!.focus());
    }
  }
  @Output() readonly toggleChangeChange = new EventEmitter<boolean>();

  constructor(private el: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef,     
    private router: Router,
    private menuService: MenuService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) {}

  ngAfterViewInit(): void {
    this.qIpt = this.el.nativeElement.querySelector('.ant-input') as HTMLInputElement;
    this.search$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap({
          complete: () => {
            this.loading = true;
          }
        })
      )
      .subscribe(value => {
        this.options = value ? this.loadMatchedMenus(value) : [];
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  loadMatchedMenus(name: string): MenuItem[] { 
    
    let menuItems: MenuItem[] = [];
    this.menuService.menus.forEach(
      menuGroup => {
        menuGroup.children?.forEach(
          menuSubGroup => {
            menuSubGroup.children?.forEach(
              assignedMenu => {
                if (assignedMenu.i18n && this.i18n.fanyi(assignedMenu.i18n).toLocaleLowerCase().includes(name.toLocaleLowerCase())) {
                  menuItems = [...menuItems, {
                    name: this.i18n.fanyi(assignedMenu.i18n),
                    url: assignedMenu.link ? assignedMenu.link : ""
                  }];
                }
                else if (assignedMenu.text && 
                          (assignedMenu.text.toLocaleLowerCase().includes(name.toLocaleLowerCase()) 
                            || this.i18n.fanyi(assignedMenu.text).toLocaleLowerCase().includes(name.toLocaleLowerCase()))) {
                    menuItems = [...menuItems, {
                              name: this.i18n.fanyi(assignedMenu.text),
                              url: assignedMenu.link ? assignedMenu.link : ""
                            }];
                }
              }
            )
          }
        )
      }
    )
    return menuItems;
    
  }

  optionSelectedChanged(event: any, menuItem: MenuItem) {
    if (event.isUserInput) {
      
      this.openPage(menuItem);
    }
  }
  openPage(menuItem: MenuItem) {
    

    this.router.navigateByUrl(menuItem.url);
  }
  qFocus(): void {
    this.focus = true;
  }

  qBlur(): void {
    this.focus = false;
    this.searchToggled = false;
    this.options.length = 0;
    this.toggleChangeChange.emit(false);
  }

  search(ev: Event): void {
    
    
    this.search$.next((ev.target as HTMLInputElement).value);
  }

  ngOnDestroy(): void {
    this.search$.complete();
    this.search$.unsubscribe();
  }
}
