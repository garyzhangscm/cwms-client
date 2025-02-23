import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN,  MenuService, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';

import { OperationType } from '../../work-task/models/operation-type';
import { OperationTypeService } from '../../work-task/services/operation-type.service';

import { Role } from '../models/role';
import { RoleService } from '../services/role.service';

@Component({
    selector: 'app-auth-role-operation-type',
    templateUrl: './role-operation-type.component.html',
    standalone: false
})
export class AuthRoleOperationTypeComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  operationTypeItems: TransferItem[] = []; 
  currentRole: Role | undefined; 
  allOperationTypes: OperationType[] = [];
  previousPage = "";
  isSpinning = false;
  unassignedText = "";
  assignedText = "";

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private roleService: RoleService,
    private menuService: MenuService,
    private message: NzMessageService,
    private operationTypeService: OperationTypeService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('operation-type'); 
    this.unassignedText = this.i18n.fanyi('unassigned');
    this.assignedText = this.i18n.fanyi('assigned');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('operation-type'));

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['roleId']) {
        // Get the role and initiate the menu assignment
        this.isSpinning = true;
        this.roleService.getRole(params['roleId']).subscribe({
          next: (roleRes) => {
            this.currentRole = roleRes;
            this.initOperationTypeAssignment(); 
            this.previousPage = `/auth/role?name=${this.currentRole.name}`;
            this.isSpinning = false;
          },
          error: () => this.isSpinning = false
        });
      } 
    });
  }

  initOperationTypeAssignment(): void {
    
    this.operationTypeService.getOperationTypes().subscribe({

      next: (operationTypeRes) => {
        this.allOperationTypes = operationTypeRes;
        
        this.loadOperationTypeItems();
      }

    }) 
  }

  // initial the transfer item control
  loadOperationTypeItems(): void { 
    this.operationTypeItems = [];
    this.allOperationTypes!.forEach(operationType => { 
      this.operationTypeItems.push({
          key: operationType.id!.toString(),
          title: operationType.name,
          description: operationType.description,
          direction: this.currentRole!.operationTypes?.some(
                assignedOperationType => operationType.id === assignedOperationType.id)  ? 
                'right' : undefined,
      });
    });
  }

  goToOperationTypePage() {
    
    this.router.navigateByUrl('work-task/operation-type');
  }


  transferListFilterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  transferListSearch(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  transferListSelect(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  transferListChange(ret: {}): void {
    console.log('nzChange', ret);
  }

  confirm(): void {
     
   //  const newlyAssignedFullyFunctionalMenuIds = currentAssignedMenuIds.filter(
   //    id => !this.accessibleMenuIds.some(accessibleMenuId => accessibleMenuId === +id) 
   //  );
   this.isSpinning = true;
   const newlyAssignedOperationTypeIds = 
      [...this.operationTypeItems.filter(item => item.direction === 'right').map(item => item['key'])]; 
     
 
    this.roleService.processOperationTypes(this.currentRole!.id, 
      newlyAssignedOperationTypeIds).subscribe(
      {
        next: () => {
          
          this.isSpinning = false;
          this.message.success(this.i18n.fanyi('message.action.success'));
          
          setTimeout(() => {
            this.return();
          }, 500);
        }, 
        error: () =>  this.isSpinning = false
    }); 
  } 
  return(): void {
    this.router.navigateByUrl(this.previousPage!);
  }

}
