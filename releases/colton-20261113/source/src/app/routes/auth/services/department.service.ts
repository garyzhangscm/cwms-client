import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Department } from '../models/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  constructor(private http: _HttpClient, private companyService: CompanyService) {}

  getDepartments(name?: string): Observable<Department[]> {
    let url = `resource/departments?companyId=${this.companyService.getCurrentCompany()?.id}`;
    if (name) {
      url = `${url}&name=${name}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get(`resource/departments/${id}`).pipe(map(res => res.data));
  }
  addDepartment(department: Department): Observable<Department> {
    return this.http.put(`resource/departments`, department).pipe(map(res => res.data));
  }
  changeDepartment(department: Department): Observable<Department> {
    return this.http.post(`resource/departments/${department.id}`, department).pipe(map(res => res.data));
  }
 
  removeDepartment(department: Department): Observable<Department> {
    return this.http.delete(`resource/departments/${department.id}`).pipe(map(res => res.data));
  }
 
  
}
