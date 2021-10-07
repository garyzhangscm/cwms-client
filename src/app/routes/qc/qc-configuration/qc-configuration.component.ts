import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-qc-qc-configuration',
  templateUrl: './qc-configuration.component.html',
})
export class QcQcConfigurationComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
