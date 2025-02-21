import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-util-quickbook-permission',
    templateUrl: './quickbook-permission.component.html',
    standalone: false
})
export class UtilQuickbookPermissionComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
