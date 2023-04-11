import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-task-operation-type',
  templateUrl: './operation-type.component.html',
})
export class WorkTaskOperationTypeComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
