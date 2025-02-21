import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RF } from '../../util/models/rf';
import { Department } from '../models/department';
import { DepartmentService } from '../services/department.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-auth-department',
    templateUrl: './department.component.html',
    styleUrls: ['./department.component.less'],
    standalone: false
})
export class AuthDepartmentComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("name"),  index: 'name' , }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , }, 
    {
      title: this.i18n.fanyi("action"),  
      buttons: [ 
        {
          text: this.i18n.fanyi("modify"),  
          type: 'link',
          click: (_record) => this.modifyDepartment(_record)
        },
        {
          text: this.i18n.fanyi("remove"),  
          type: 'link',
          click: (_record) => this.removeDepartment(_record)
        }
      ]
    }
  ]; 

  
  searchForm!: UntypedFormGroup;
  departments: Department[] = [];
  searchResult = "";
   
  displayOnly = false;
  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private departmentService: DepartmentService,
    private messageService: NzMessageService,
    private router: Router, 
    private userService: UserService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/auth/department").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.department'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });}

    
  resetForm(): void {
    this.searchForm.reset();
    this.departments = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.departmentService
      .getDepartments(this.searchForm.value.name)
      .subscribe({

        next: (departmentRes) => {
          this.departments = departmentRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: departmentRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
 
  removeDepartment(department: Department) : void{
    this.isSpinning = true; 
    this.departmentService.removeDepartment(department).subscribe({

      next: () => { 
        this.isSpinning = false; 
        this.messageService.success(this.i18n.fanyi('message.remove.success'));
        this.search();

      },
      error: () => {
        this.isSpinning = false; 
      }
    });
    
  }
  
  modifyDepartment(department: Department) : void{
    this.router.navigateByUrl(`/auth/department/maintenance?id=${department.id}`);
    
  }

}
