import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { Client } from '../../common/models/client';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { OperationType } from '../../work-task/models/operation-type';
import { Menu } from '../models/menu';
import { MenuGroup } from '../models/menu-group';
import { Permission } from '../models/permission';
import { Role } from '../models/role';
import { RoleMenu } from '../models/role-menu';
import { RolePermission } from '../models/role-permission';
import { User } from '../models/user';
import { MenuService } from '../services/menu.service';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';
import { UserService } from '../services/user.service';
 

@Component({
    selector: 'app-auth-role',
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.less'],
    standalone: false
})
export class AuthRoleComponent implements OnInit {
  listOfColumns: Array<ColumnItem<Role>> = [
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: Role, b: Role )  =>  a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      sortOrder: null,
      sortFn: (a: Role, b: Role) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      sortOrder: null,
      sortFn: (a: Role, b: Role) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];
  listOfSubTableColumns: Array<ColumnItem<User>> = [
    {
      name: 'username',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.username.localeCompare(b.username),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'firstname',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.firstname.localeCompare(b.firstname),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'lastname',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.lastname.localeCompare(b.lastname),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'email',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.email.localeCompare(b.email),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'locked',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareBoolean(a.locked, b.locked),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];


  listOfMenuTableColumns: Array<ColumnItem<RoleMenu>> = [
    {
      name: 'menuGroup',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.menuGroup!.localeCompare(b.menu.menuGroup!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'menuSubGroup',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.menuSubGroup!.localeCompare(b.menu.menuSubGroup!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.i18n!.localeCompare(b.menu.i18n!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'sequence',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.sequence - b.menu.sequence,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'menu.i18n',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.i18n!.localeCompare(b.menu.i18n!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'link',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.link!.localeCompare(b.menu.link!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'displayOnly',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => this.utilService.compareBoolean(a.displayOnlyFlag, b.displayOnlyFlag),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  
  listOfClientColumns: Array<ColumnItem<Client>> = [
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.firstname',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.contactorFirstname.localeCompare(b.contactorFirstname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.lastname',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.contactorLastname.localeCompare(b.contactorLastname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'country',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressCountry.localeCompare(b.addressCountry),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'state',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressState.localeCompare(b.addressState),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'county',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressCounty!.localeCompare(b.addressCounty!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'city',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressCity.localeCompare(b.addressCity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'district',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressDistrict!.localeCompare(b.addressDistrict!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line1',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressLine1.localeCompare(b.addressLine1),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line2',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressLine2!.localeCompare(b.addressLine2!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'postcode',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressPostcode.localeCompare(b.addressPostcode),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];
  searching = false;
  searchResult = '';
  isSpinning = false;


  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private roleService: RoleService,
    private userService: UserService,
    private menuService: MenuService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private utilService: UtilService,
    private localCacheService: LocalCacheService, 
    private permissionService: PermissionService,
  ) {
    userService.isCurrentPageDisplayOnly("/auth/role").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );     
   }

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllRoles: Role[] = [];
  listOfDisplayRoles: Role[] = [];
  
  mapOfNzTreeNodeOptions: { [key: string]: NzTreeNodeOptions[] } = {};
  mapOfDefaultCheckedKeys: { [key: string]: string[] } = {};

  allMenus: MenuGroup[] = [];

  expandSet = new Set<number>();

  tabIndex = 0;

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllRoles = [];
    this.listOfDisplayRoles = [];
  }

  // tab index: when we refresh from action of
  // deassign the user or menu, whether we will display
  // the user tab or menu tab
  // 0: display the user tab under the role record
  // 1: display the menu tab under the role record
  search(tabIndex: number = 0): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.roleService.getRoles(this.searchForm!.controls.name.value).subscribe(
      roleRes => {
        this.listOfAllRoles = roleRes;
        this.listOfDisplayRoles = roleRes;

        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: roleRes.length,
        });

        // check if we have any role with details expanded. If we find those roles, let's
        // refresh the content as well
        this.listOfAllRoles.forEach(role => {
          if (this.expandSet.has(role.id)) {
            this.loadUserAndMenuAndClientAndPermission(this.expandSet.has(role.id), role, tabIndex);
          }
        });
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }


  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.role'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {
        this.searchForm!.value.name.setValue(params['name']);
        this.search();
      }
    });
    this.loadAllMenus();
  }
  // Load all menus so when we expand the roles, we can display
  // the menu that assigned to the role
  loadAllMenus(): void {
    // Get all menus and accessible menus by role
    this.menuService.getMenus().subscribe(menuRes => {
      this.allMenus = menuRes;
    });
  }

  disableRole(roleId: number): void {
    this.roleService.disableRole(roleId).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  enableRole(roleId: number): void {
    this.roleService.enableRole(roleId).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  loadUserAndMenuAndClientAndPermission(expanded: boolean, role: Role, tabIndex: number = 0): void {
    if (expanded) {
      this.expandSet.add(role.id);
    } else {
      this.expandSet.delete(role.id);
    }

    // By default when we get role from the service, it will contains the menu informaiton
    // but not the user infomation, when we expand the role to see the menu and users,
    // we will need to load the users for the specific role
    this.userService.getUsers('', role.name).subscribe(userRes => {
      role.users = userRes;
    });
    // role.menus only stored the menus without the menugroup and sub group information
    // Let's fix this so we can display the information about this 2

    // available role menus: all the menus that both
    // 1. accessible to the current role
    // 2. accessible to the current user
    let availableRoleMenus: RoleMenu[] = [];

    this.allMenus.forEach(menuGroup => {
      menuGroup.children.forEach(menuSubGroup => {
        menuSubGroup.children.forEach(menu => {
          role.roleMenus.forEach(assignedMenu => {
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
    // Let's sort the menus based on the sequence of menu group / menu sub group / menu
    role.roleMenus.sort((a, b) => a.menu.overallSequence! - b.menu.overallSequence!);
    this.tabIndex = tabIndex;

    // load the client information
    role.clientAccesses.forEach(
      roleClientAccess => {
        if (roleClientAccess.client == null) {

          this.localCacheService.getClient(roleClientAccess.clientId).subscribe(
            client => roleClientAccess.client = client
          )
        }
      }
    )
    // load the permissions
    
    if (this.allMenus.length > 0) {
      // continue only if the user can access certain menu
      this.setupMenuPermission(role.id, role.rolePermissions, this.allMenus, availableRoleMenus);
    }
  }

  deassignUser(roleId: number, userId: number): void {
    this.roleService.deassignUser(roleId, userId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(0);
    });
  }
  deassignMenu(roleId: number, menuId: number): void {
    this.roleService.deassignMenu(roleId, menuId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(1);
    });
  }
  onExpandChange(role: Role, checked: boolean): void {
    if (checked) {
      this.expandSet.add(role.id);
      this.loadUserAndMenuAndClientAndPermission(true, role);
    } else {
      this.expandSet.delete(role.id);
    }


  }

  
  setupMenuPermission(roleId: number, rolePermissions: RolePermission[], menuGroups: MenuGroup[], 
    availableRoleMenus: RoleMenu[]) {
    
    let menuIdSet = new Set<number>();
    availableRoleMenus.forEach(
      roleMenu => menuIdSet.add(roleMenu.menu.id)
    ) ;
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
        this.setupPermission(roleId, rolePermissions, menuGroups, availableRoleMenus, permissions); 
      }
    })
    
  }
  
  setupPermission(roleId: number, 
    existingRolePermissions: RolePermission[], menuGroups: MenuGroup[], 
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
    // setup the tree node for display
    let rolePermissions : NzTreeNodeOptions[] = [];
    let defaultCheckedKeys : string[] = [];
 
    menuGroups.forEach(
      menuGroup => {
        let menuGroupNode: NzTreeNodeOptions = {
          title: menuGroup.text,
          key: menuGroup.id.toString(),
          expanded: false,
          children: [],
          isLeaf: false,
          disabled: true,
        };
        menuGroup.children.forEach(
          menuSubGroup => {

            let menuSubGroupNode: NzTreeNodeOptions = {
              title: menuSubGroup.text,
              key: menuSubGroup.id.toString(),
              expanded: false,
              children: [],
              isLeaf: false,
              disabled: true,
            };

            menuSubGroup.children.filter(menu => {
              // only continue if the menu is accessbile for both 
              // current role and current user, and it nos display only
              let roleMenu = availableRoleMenus.find(
                availableRoleMenu => availableRoleMenu.menu.id == menu.id
              );
              return roleMenu != null && !roleMenu.displayOnlyFlag;
          }).forEach(
              menu => {                
                let menuNode: NzTreeNodeOptions = {
                  title: menu.text,
                  key: menu.id.toString(),
                  expanded: false,
                  children: [],
                  isLeaf: false,
                  disabled: true,
                };
                
                permissionMap.get(menu.name)?.forEach(
                  permission => {
                    const existingRolePermission = this.getExistsingRolePermission(
                      existingRolePermissions, menu.id, permission.name
                    ); 
                    // console.log(`${menu.id.toString()}#${permission.name}: 
                    // existingRolePermission? ${existingRolePermission != null}
                    // existingRolePermission.allowAccess: ${existingRolePermission?.allowAccess}`);
                    menuNode.children = [...menuNode.children!, 
                    {              
                      title: permission.description,
                      key: `${menu.id.toString()}#${permission.name}`,
                      expanded: false,
                      children: [],
                      isLeaf: true,
                      disabled: true,
                    }];
                    if (existingRolePermission && existingRolePermission.allowAccess) {
                      defaultCheckedKeys = [...defaultCheckedKeys, `${menu.id.toString()}#${permission.name}`]
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
          rolePermissions = [...rolePermissions, menuGroupNode];
        }
      }
    ); 
 

    this.mapOfNzTreeNodeOptions[roleId] = [...rolePermissions];
    this.mapOfDefaultCheckedKeys[roleId] = [...defaultCheckedKeys];
    // this.setupNodesCheckStatus(this.rolePermissions);
    // console.log(`=========   Tree    Node - ${roleId}============`)
    // this.displayTreeNodes(this.mapOfNzTreeNodeOptions[roleId]);

  }

  displayTreeNodes(nodes: NzTreeNodeOptions[]) {
    nodes.forEach(
      node => this.displayTreeNode(0, node)
    )
  }
  displayTreeNode(level: number, node: NzTreeNodeOptions) {
    let prefix = "";
    for (let i = 0; i < level; i++) {
      prefix += ">"
    }
    console.log(`${prefix} node: ${node.title}`);
    node.children?.forEach(
      childNode => this.displayTreeNode(level +1, childNode)
    )
  }

  getExistsingRolePermission(existingRolePermissions: RolePermission[], 
    menuId: number, permissionName: string) : RolePermission | undefined {

    return existingRolePermissions.find(
      rolePermission => rolePermission.permission.menu!.id == menuId && rolePermission.permission.name == permissionName
    );
  }

  
  @ViewChild('operationTypeTable', { static: true })
  operationTypeTable!: STComponent;
  operationTypecolumns: STColumn[] = [ 
    
    { title: this.i18n.fanyi("name"),  index: 'name' ,  },  
    { title: this.i18n.fanyi("description"),  index: 'description' ,  },  
    { title: this.i18n.fanyi("defaultPriority"),  index: 'defaultPriority' ,  },  
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn',  
    },      
  ]; 
  deassignOperationType(roleId: number, operationTypeId: number) {
    this.isSpinning = true;
    this.roleService.deassignOperationType(roleId, operationTypeId).subscribe({

      next: () => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
        this.search(4);
      },
      error: () => this.isSpinning = false
    })
  }
}
