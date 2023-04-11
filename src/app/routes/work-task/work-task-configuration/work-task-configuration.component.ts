import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-task-work-task-configuration',
  templateUrl: './work-task-configuration.component.html',
})
export class WorkTaskWorkTaskConfigurationComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
