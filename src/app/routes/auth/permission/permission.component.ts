import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-auth-permission',
  templateUrl: './permission.component.html',
})
export class AuthPermissionComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
