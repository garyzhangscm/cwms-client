import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Role } from '../models/role';
import { I18NService } from '@core';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { NzMessageService } from 'ng-zorro-antd/message';

interface MenuTreeNode {
  title: string;
  key: string;
  expanded?: boolean;
  children?: MenuTreeNode[];
  isLeaf?: boolean;
}

@Component({
  selector: 'app-auth-role-maintenance-confirm',
  templateUrl: './role-maintenance-confirm.component.html',
})
export class AuthRoleMaintenanceConfirmComponent implements OnInit {
  currentRole: Role;
  pageTitle: string;
  menuTree: MenuTreeNode[];

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private roleService: RoleService,
    private router: Router,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.role.confirm.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.role.confirm.title'));
    this.currentRole = JSON.parse(sessionStorage.getItem('role-maintenance.role'));
    this.initMenuTree();
  }

  initMenuTree() {
    this.menuTree = [];
    console.log(`Start to init menu tree with data:\n ${JSON.stringify(this.currentRole.menuGroups)}`);
    this.currentRole.menuGroups.forEach(menuGroup => {
      const menuGroupTreeNode: MenuTreeNode = {
        title: this.i18n.fanyi(menuGroup.i18n),
        key: menuGroup.id.toString(),
        expanded: true,
        children: [],
      };
      // add child to it
      menuGroup.children.forEach(menuSubGroup => {
        const menuSubGroupTreeNode: MenuTreeNode = {
          title: this.i18n.fanyi(menuSubGroup.i18n),
          key: menuSubGroup.id.toString(),
          expanded: true,
          children: [],
        };
        // add child to it
        menuSubGroup.children.forEach(menu => {
          const menuTreeNode: MenuTreeNode = {
            title: this.i18n.fanyi(menu.i18n),
            key: menu.id.toString(),
            isLeaf: true,
          };
          menuSubGroupTreeNode.children.push(menuTreeNode);
        });
        menuGroupTreeNode.children.push(menuSubGroupTreeNode);
      });
      this.menuTree.push(menuGroupTreeNode);
    });
  }
  confirm() {
    this.roleService.addRole(this.currentRole).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.new.complete'));
      setTimeout(() => this.goToNextPage(), 2000);
    });
  }

  goToNextPage(): void {
    const url = `/auth/role?name=${this.currentRole.name}`;
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number) {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
      case 1:
        this.router.navigateByUrl('/auth/role-user?new-role');
        break;
      case 2:
        this.router.navigateByUrl('/auth/role-menu?new-role');
        break;
      default:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
    }
  }
}
