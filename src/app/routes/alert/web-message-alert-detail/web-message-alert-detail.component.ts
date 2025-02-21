import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-alert-web-message-alert-detail',
    templateUrl: './web-message-alert-detail.component.html',
    standalone: false
})
export class AlertWebMessageAlertDetailComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
