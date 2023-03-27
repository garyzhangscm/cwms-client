import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { MenuGroup } from '../models/menu-group';
import { Permission } from '../models/permission';
import { MenuService } from '../services/menu.service';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-auth-role-permission',
  templateUrl: './role-permission.component.html',
})
export class AuthRolePermissionComponent implements OnInit {

  isSpinning = false;
  rolePermissions: NzTreeNodeOptions[] = [];
  
  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService, 
    private roleService: RoleService,
    private menuService: MenuService,
    private message: NzMessageService,
    private permissionService: PermissionService,
    private router: Router,) { 
    this.titleService.setTitle(this.i18n.fanyi('permission'));
  }

  ngOnInit(): void { 

    this.isSpinning = true;
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.roleId) {
        // load the accessible menus
        this.menuService.getWebMenus().subscribe({
          next: (accessibleMenus) => {
            if (accessibleMenus.length > 0) {
              // continue only if the user can access certain menu
              this.setupMenuPermission(accessibleMenus);
            }

          }, 
          error: () => this.isSpinning = false
        });
      }
      else {
        this.isSpinning = false;
      }
    });

  }

  setupMenuPermission(menuGroups: MenuGroup[]) {
    
      let menuIdSet = new Set<number>();
      menuGroups.forEach(
        menuGroup => {
          menuGroup.children.forEach(
            menuSubGroup => {
              menuSubGroup.children.forEach(
                menu => {
                  menuIdSet.add(menu.id);
                }
              )
            }
          )
        }
      );
      
      const menuIds = [...menuIdSet].join(',');
      this.permissionService.getPermissions(menuIds).subscribe({
        next: (permissions) => {
          this.setupPermission(permissions);
          this.isSpinning = false;

        }
      })
  }

  setupPermission(permissions:  Permission[]) {
    let permissionMap: Map<string, Permission[]> = new Map();

    permissions.forEach(
      permission => {
        let menuName = permission.menu? permission.menu.name : permission.menuName;
        if (menuName) {
          let menuPermissions: Permission[] = [];
          if (permissionMap.has(menuName)) {
            menuPermissions = permissionMap.get(menuName)!;
          }
          menuPermissions = [...menuPermissions, permission];
          permissionMap.set(menuName, menuPermissions);

        }
      }
    );

    // setup the tree node for display
    this.rolePermissions = [];
    for (let menuName of permissionMap.keys()) {
        const treeNode: NzTreeNodeOptions = {
          title: menuName,
          key: menuName,
          expanded: true,
          children: [],
          isLeaf: false
        };

        permissionMap.get(menuName)?.forEach(
          permission => {
            treeNode.children = [...treeNode.children!, 
            {              
              title: permission.description,
              key: permission.name,
              expanded: false,
              children: [],
              isLeaf: true
            }]
          }
        );
        
        this.rolePermissions = [...this.rolePermissions, treeNode];
    }

  }

}
