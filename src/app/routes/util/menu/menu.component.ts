import { formatDate } from '@angular/common';
import { Component, Inject, OnInit,  ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup,  } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn,  } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { Menu } from '../../auth/models/menu';
import { MenuGroup } from '../../auth/models/menu-group';
import { MenuSubGroup } from '../../auth/models/menu-sub-group';
import { MenuService } from '../../auth/services/menu.service'; 
import { UserService } from '../../auth/services/user.service';
import { UtilService } from '../services/util.service';

@Component({
    selector: 'app-util-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.less'],
    standalone: false
})
export class UtilMenuComponent implements OnInit {
  
  displayOnly = false;
  
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private messageService: NzMessageService, 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    private userService: UserService, 
    private menuService: MenuService,
  ) { 
    userService.isCurrentPageDisplayOnly("/util/menu").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                    
  }
 

  // Form related data and functions
  searchForm!: UntypedFormGroup; 
 
  searchResult = '';

  tabSelectedIndex = 0;
  // Table data for display
  listOfAllMenus: Menu[] = []; 
 

  isSpinning = false;
 

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.menu'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null], 
    });

    // IN case we get the number passed in, refresh the display
    // and show the order information
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllMenus = []; 

  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.listOfAllMenus = []; 
     

    this.menuService.getMenus().subscribe(
      menuRes => {
 
        // filter by name
        if (this.searchForm.controls.name.value) {
          menuRes.forEach(
            menuGroup => {
              if (menuGroup.text.toLowerCase().includes(this.searchForm.controls.name.value)) {
                // add the whole menuGrup to the result
                this.listOfAllMenus = [...this.listOfAllMenus, ...this.getMenusFromMenuGroup(menuGroup)];
              }
              else {
                // check if we have matched sub group or menu item
                menuGroup.children.forEach(
                  menuSubGroup => {
                    if (menuSubGroup.text.toLowerCase().includes(this.searchForm.controls.name.value)) {
                      // add the whole sub menuGrup to the result
                      this.listOfAllMenus = [...this.listOfAllMenus, ...this.getMenusFromMenuSubGroup(menuGroup, menuSubGroup)];
                    }
                    else {
                      menuSubGroup.children.forEach(
                        menu => {                          
                          if (menu.text.toLowerCase().includes(this.searchForm.controls.name.value)) {
                            // add the whole sub menuGrup to the result
                            this.listOfAllMenus = [...this.listOfAllMenus, 
                                    {
                                      menuGroup: this.i18n.fanyi(menuGroup.i18n),
                                      menuSubGroup: this.i18n.fanyi(menuSubGroup.i18n),
                                      id: menu.id,
                                      text: menu.text,
                                      i18n: menu.i18n,
                                      link: menu.link,
                                      sequence: menu.sequence,
                                      overallSequence: menu.overallSequence,
                                      enabled: menu.enabled,
                                      systemAdminMenuFlag: menu.systemAdminMenuFlag, 
                                      name: menu.name
                                  }];
                          }
                        }
                      );
                    }
                  }
                )
              }
            }
          )
        }
        else {
          menuRes.forEach(
            menuGroup =>  this.listOfAllMenus = [...this.listOfAllMenus, ...this.getMenusFromMenuGroup(menuGroup)]
          );
        }
        

        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: this.listOfAllMenus.length,
        });
          
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }
  
  getMenusFromMenuGroup(menuGroup: MenuGroup) : Menu[]{
    let menuList: Menu[] = [];
    menuGroup.children.forEach(
      menuSubGroup => {
        menuList = [...menuList, ...this.getMenusFromMenuSubGroup(menuGroup, menuSubGroup)];
      }
    )

    return menuList;

  }
  
  getMenusFromMenuSubGroup(menuGroup: MenuGroup, menuSubGroup: MenuSubGroup) : Menu[]{ 

    
    let menuList: Menu[] = [];
    menuSubGroup.children.forEach(
      menu =>  menuList = [...menuList, {
                    menuGroup: this.i18n.fanyi(menuGroup.i18n),
                    menuSubGroup: this.i18n.fanyi(menuSubGroup.i18n),
                    id: menu.id,
                    text: menu.text,
                    i18n: menu.i18n,
                    link: menu.link,
                    sequence: menu.sequence,
                    overallSequence: menu.overallSequence,
                    enabled: menu.enabled,
                    systemAdminMenuFlag: menu.systemAdminMenuFlag, 
                    name: menu.name
                }]
      
    );
    return  menuList

  }
   

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    { title: this.i18n.fanyi("menuGroup"), index: 'menuGroup', iif: () => this.isChoose('menuGroup'), },  
    { title: this.i18n.fanyi("menuSubGroup"), index: 'menuSubGroup', iif: () => this.isChoose('menuSubGroup'), },  
    { title: this.i18n.fanyi("name"), index: 'name', iif: () => this.isChoose('name'), },  
    { title: this.i18n.fanyi("link"), index: 'link', iif: () => this.isChoose('link'), }, 
    { title: this.i18n.fanyi("text"), index: 'text', iif: () => this.isChoose('text'), }, 
    { title: this.i18n.fanyi("sequence"), index: 'sequence', iif: () => this.isChoose('sequence'), }, 
    { title: this.i18n.fanyi("enabled"), index: 'enabled', iif: () => this.isChoose('enabled'), }, 
    { title: this.i18n.fanyi("systemAdminMenuFlag"), index: 'systemAdminMenuFlag', iif: () => this.isChoose('systemAdminMenuFlag'), }, 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];
  customColumns = [ 
    { label: this.i18n.fanyi("menuGroup"), value: 'menuGroup', checked: true }, 
    { label: this.i18n.fanyi("menuSubGroup"), value: 'menuSubGroup', checked: true }, 
    { label: this.i18n.fanyi("name"), value: 'name', checked: true }, 
    { label: this.i18n.fanyi("link"), value: 'link', checked: true }, 
    { label: this.i18n.fanyi("text"), value: 'text', checked: true }, 
    { label: this.i18n.fanyi("sequence"), value: 'sequence', checked: true }, 
    { label: this.i18n.fanyi("enabled"), value: 'enabled', checked: true }, 
    { label: this.i18n.fanyi("systemAdminMenuFlag"), value: 'systemAdminMenuFlag', checked: true },  
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  disableMenu(menu: Menu) {

    this.isSpinning = true;
    this.menuService.disableMenu(menu).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.action.success"));
      }
      ,
      error: () => this.isSpinning = false
    });
  }
  enableMenu(menu: Menu) {

    this.isSpinning = true;
    this.menuService.enableMenu(menu).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.action.success"));
      }
      ,
      error: () => this.isSpinning = false
    });
  }
}
