import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { MenuGroup } from '../models/menu-group';
import { Permission } from '../models/permission';
import { Role } from '../models/role';
import { RoleMenu } from '../models/role-menu';
import { RolePermission } from '../models/role-permission';
import { MenuService } from '../services/menu.service';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';

@Component({
    selector: 'app-auth-role-permission',
    templateUrl: './role-permission.component.html',
    standalone: false
})
export class AuthRolePermissionComponent implements OnInit {

  pageTitle = "";
  previousPage = "";
  isSpinning = false;
  rolePermissions: NzTreeNodeOptions[] = [];
  defaultCheckedKeys: string[] = [];
  currentRole: Role | undefined;
  currentUserAccessibleMenuGroup: MenuGroup[] = [];
  
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
    this.pageTitle = this.i18n.fanyi('permission');
  }

  ngOnInit(): void { 

    this.isSpinning = true;
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.roleId) {
        this.roleService.getRole(params.roleId).subscribe({
          next: (roleRes) => {
            this.currentRole = roleRes;
            this.previousPage = `/auth/role?name=${roleRes.name}`; 
            
            // load  the accessible menus of current user and 
            // then loop through the menus that both accessible
            // by the current user and assign to the current role
            // 1. accessibleMenus / currentUserAccessibleMenuGroup: menu that
            //    accesible to the current user
            // 2. this.currentRole!.roleMenus: accessbile menu by current role
            this.menuService.getWebMenus().subscribe({
              next: (accessibleMenus) => {
                this.currentUserAccessibleMenuGroup = accessibleMenus;
                
                // available role menus: all the menus that both
                // 1. accessible to the current role
                // 2. accessible to the current user
                let availableRoleMenus: RoleMenu[] = [];

                if (accessibleMenus.length > 0) {
                  // continue only if the user can access certain menu
                  accessibleMenus.forEach(menuGroup => {
                    menuGroup.children.forEach(menuSubGroup => {
                      menuSubGroup.children.forEach(menu => {
                        this.currentRole!.roleMenus.forEach(assignedMenu => {
                          if (assignedMenu.menu.id === menu.id) {
                            assignedMenu.menu.menuGroup = this.i18n.fanyi(menuGroup.i18n);
                            assignedMenu.menu.menuSubGroup = this.i18n.fanyi(menuSubGroup.i18n);
                            assignedMenu.menu.overallSequence = menuGroup.sequence * 10000 + menuSubGroup.sequence * 100 + menu.sequence;
                            availableRoleMenus = [...availableRoleMenus, assignedMenu];
                          }
                        });
                      });
                    });
                  });

                  this.setupMenuPermission(this.currentRole!.rolePermissions, accessibleMenus,  availableRoleMenus);
                }

              }, 
              error: () => this.isSpinning = false
            }); 
          }, 
          error: () => this.isSpinning = false
        }) 
      }
      else {
        this.isSpinning = false;
      }
    });

  }
  

  return(): void {
    this.router.navigateByUrl(this.previousPage!);
  }
  setupMenuPermission(rolePermissions: RolePermission[], menuGroups: MenuGroup[], availableRoleMenus: RoleMenu[]) {
    
      let menuIdSet = new Set<number>();
      availableRoleMenus.forEach(
        roleMenu => menuIdSet.add(roleMenu.menu.id)
      ) 
/**
 * 
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
 * 
 */
       
      const menuIds = [...menuIdSet].join(',');
      this.permissionService.getPermissions(menuIds).subscribe({
        next: (permissions) => {
          this.setupPermission(rolePermissions, menuGroups, availableRoleMenus, permissions);
          this.isSpinning = false;

        }
      })
  }

  setupPermission(existingRolePermissions: RolePermission[], menuGroups: MenuGroup[], 
    availableRoleMenus: RoleMenu[], permissions:  Permission[]) {
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
    this.defaultCheckedKeys = [];

    menuGroups.forEach(
      menuGroup => {
        let menuGroupNode: NzTreeNodeOptions = {
          title: menuGroup.text,
          key: menuGroup.id.toString(),
          expanded: false,
          children: [],
          isLeaf: false
        };
        menuGroup.children.forEach(
          menuSubGroup => {

            let menuSubGroupNode: NzTreeNodeOptions = {
              title: menuSubGroup.text,
              key: menuSubGroup.id.toString(),
              expanded: false,
              children: [],
              isLeaf: false
            };

            menuSubGroup.children.filter(menu => {
                // only continue if the menu is accessbile for both 
                // current role and current user, and it nos display only
                let roleMenu = availableRoleMenus.find(
                  availableRoleMenu => availableRoleMenu.menu.id == menu.id
                );
                return roleMenu != null && !roleMenu.displayOnlyFlag;
            })
            .forEach(
              menu => {                
                let menuNode: NzTreeNodeOptions = {
                  title: menu.text,
                  key: menu.id.toString(),
                  expanded: false,
                  children: [],
                  isLeaf: false
                };
                
                permissionMap.get(menu.name)?.forEach(
                  permission => {
                    const existingRolePermission = this.getExistsingRolePermission(
                      existingRolePermissions, menu.id, permission.name
                    ); 
                    
                    menuNode.children = [...menuNode.children!, 
                    {              
                      title: permission.description,
                      key: `${menu.id.toString()}#${permission.name}`,
                      expanded: false,
                      children: [],
                      isLeaf: true,
                    }];
                    if (existingRolePermission && existingRolePermission.allowAccess) {
                      this.defaultCheckedKeys = [...this.defaultCheckedKeys, `${menu.id.toString()}#${permission.name}`]
                    } 
                  }
                ); 
                // attach the node only if there's sub - node
                if (menuNode.children!.length > 0) {
                  menuSubGroupNode.children = [...menuSubGroupNode.children!, 
                    menuNode]; 
                }
              }
            );

            if (menuSubGroupNode.children!.length > 0) {
              menuGroupNode.children = [...menuGroupNode.children!, 
                menuSubGroupNode];
            }
          }
        );
        
        if (menuGroupNode.children!.length > 0) {
          this.rolePermissions = [...this.rolePermissions, menuGroupNode];
        }
      }
    );
 

  }
 

  getExistsingRolePermission(existingRolePermissions: RolePermission[], menuId: number, permissionName: string) : RolePermission | undefined {

    return existingRolePermissions.find(
      rolePermission => rolePermission.permission.menu!.id == menuId && rolePermission.permission.name == permissionName
    );
  }

  assignPermission() {
    if (!this.currentRole) {
      this.message.error(this.i18n.fanyi("cannot-get-current-role"));
      return;
    }
    this.isSpinning = true;
 
    let leafNodes :NzTreeNodeOptions[] = this.getLeafNodes(this.rolePermissions); 

    let newRolePermissions = this.setupPermissions(leafNodes);
    this.roleService.assginPermission(this.currentRole!.id, newRolePermissions).subscribe({
      next: () => {
        this.message.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning = false;

      }, 
      error: () => this.isSpinning = false
    }) 
  }
  setupPermissions(nodes: NzTreeNodeOptions[]) : RolePermission[] {
    let rolePermissions : RolePermission[] = [];

    nodes.forEach(
      node => {
        // node's key should be menu id - permission.name
        // node's title should be permission.description
        let menuId = node.key.substring(0, node.key.indexOf("#"));
        let permissionName = node.key.substring(node.key.indexOf("#") + 1); 
        rolePermissions = [...rolePermissions, 
        {        
          role: this.currentRole!,
          permission: {            
            name: permissionName,
            description: node.title,
            menuName: "",
            menuId: +menuId
          },
          allowAccess: node.checked == null ? false : node.checked
        }]
      }
    )

    return rolePermissions;
  }

  getLeafNodes(nodes: NzTreeNodeOptions[]) : NzTreeNodeOptions[] {
    
     let leafNodes :NzTreeNodeOptions[] = [];
     nodes.forEach(
      node => {
        if (node.isLeaf) {
          leafNodes = [...leafNodes, node];
        }
        else if (node.children && node.children.length > 0) {
          leafNodes = [...leafNodes, ...this.getLeafNodes(node.children)];
        }
      }
     )
     return leafNodes;
  }
 
}
