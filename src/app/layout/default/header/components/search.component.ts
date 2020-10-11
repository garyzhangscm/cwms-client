import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
} from '@angular/core'; 
import { Router } from '@angular/router';
import { Menu, MenuService } from '@delon/theme';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
        [attr.placeholder]="'menu.search.placeholder' | translate"
      />
    </nz-input-group>
    <!--

    <nz-autocomplete nzBackfill #auto>
      <nz-auto-option *ngFor="let i of options" [nzValue]="i">{{ i }}</nz-auto-option>
    </nz-autocomplete>

    -->
    <nz-autocomplete #auto>
        <nz-auto-option class="global-search-item" *ngFor="let menu of filteredMenus" [nzValue]="menu.text">
          <a class="global-search-item-desc" href="'#' + menu.link"> {{ menu.text }} </a>
        </nz-auto-option>
      </nz-autocomplete>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderSearchComponent implements AfterViewInit, OnDestroy {
  q = '';
  qIpt: HTMLInputElement | null = null;
  filteredMenus: Menu[] = [];
  options: string[] = [];
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
    this.searchToggled = true;
    this.focus = true;
    setTimeout(() => this.qIpt!.focus(), 300);
  }

  constructor(private el: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef, private menuService: MenuService, private router: Router) {}

  ngAfterViewInit(): void {
    this.qIpt = this.el.nativeElement.querySelector('.ant-input') as HTMLInputElement;
    this.search$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.options = value ? [value, value + value, value + value + value] : [];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  qFocus(): void {
    this.focus = true;
  }

  qBlur(): void {
    this.focus = false;
    this.searchToggled = false;
  }

  search(ev: KeyboardEvent): void {
    if (ev.key === 'Enter') {
      return;
    }
    this.loading = true;
    this.search$.next((ev.target as HTMLInputElement).value);
  }

  ngOnDestroy(): void {
    this.search$.complete();
    this.search$.unsubscribe();
  }
  onChange(value: string): void {
    this.filteredMenus = [];
    // console.log(`Start to list from menu   \n ${value}`);
    this.menuService.menus.forEach(menu => {
      this.addFilterMenu(value, menu);
    });
  }
  addFilterMenu(value: string, menu: Menu) : void{
    if (menu.text?.includes(value) && menu.link) {
      // console.log(`### added menu \n ${menu.text} - ${menu.link}`);
      this.filteredMenus.push(menu);
    }
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(childMenu => {
        this.addFilterMenu(value, childMenu);
      });
    }
  }
  openMenu(menu: Menu) : void{
    console.log(`start to navigate to ${menu.link}`);
    this.router.navigateByUrl(menu.link!);
  }
}
