import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-dashboard-default',
  templateUrl: './default.component.html',
})
export class DashboardDefaultComponent implements OnInit {
  constructor(private http: _HttpClient) {}
  data: any[];
  fields: string[];
  ngOnInit() {
    this.data = [
      {
        name: '空库位',
        零拣一: 251,
        零拣二: 179,
        箱拣: 59,
        存储: 77,
        入库暂存: 31,
        出库暂存: 23,
        码盘: 15,
        加工: 5,
        月台: 7,
        停车场: 20,
        贴标作业区: 10,
      },
      {
        name: '半满库位',
        零拣一: 37,
        零拣二: 51,
        箱拣: 27,
        存储: 53,
        入库暂存: 17,
        出库暂存: 5,
        码盘: 0,
        加工: 0,
        月台: 0,
        停车场: 0,
        贴标作业区: 0,
      },
      {
        name: '全满库位',
        零拣一: 147,
        零拣二: 211,
        箱拣: 5,
        存储: 27,
        入库暂存: 15,
        出库暂存: 7,
        码盘: 0,
        加工: 0,
        月台: 5,
        停车场: 11,
        贴标作业区: 0,
      },
    ];
    this.fields = [
      '零拣一',
      '零拣二',
      '箱拣',
      '存储',
      '入库暂存',
      '出库暂存',
      '码盘',
      '加工',
      '月台',
      '停车场',
      '贴标作业区',
    ];
  }
}
