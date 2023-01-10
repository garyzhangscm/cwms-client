import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-auth-user-warehouse',
  templateUrl: './user-warehouse.component.html',
})
export class AuthUserWarehouseComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
