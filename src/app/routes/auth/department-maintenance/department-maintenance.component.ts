import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferChange } from 'ng-zorro-antd/transfer';

import { QCRule } from '../../qc/models/qc-rule';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Department } from '../models/department';
import { DepartmentService } from '../services/department.service';

@Component({
    selector: 'app-auth-department-maintenance',
    templateUrl: './department-maintenance.component.html',
    standalone: false
})
export class AuthDepartmentMaintenanceComponent implements OnInit { 

  currentDepartment!: Department;
  stepIndex = 0;
  pageTitle: string = "";
  newDepartment = true;
  isSpinning = false; 


  constructor(private http: _HttpClient,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.auth.department-maintenance');

    this.currentDepartment = this.createEmptyDepartment();
  }

  createEmptyDepartment(): Department {
    return {  
      companyId: this.companyService.getCurrentCompany()!.id,
      name: "",
      description: ""
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) { 
        this.departmentService.getDepartment(params.id)
          .subscribe(
            {
              next: (departmentRes) => {

                this.currentDepartment = departmentRes;

                this.newDepartment = false;
              }
            });  
      }
      else {
        
        this.newDepartment = true;
      }
    }); 

}


previousStep(): void {
    this.stepIndex -= 1;
}
nextStep(): void {
    this.stepIndex += 1;

}

confirm(): void {
    this.isSpinning = true;
    
    if (this.newDepartment) {

      this.departmentService.addDepartment(this.currentDepartment)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/auth/department?name=${this.currentDepartment.name}`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.departmentService.changeDepartment(this.currentDepartment)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/auth/department?name=${this.currentDepartment.name}`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
        
    }
  }
   

}
