import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-util-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.component.html',
})
export class UtilStackedBarChartComponent {
  @Input() data: [];
  @Input() fields: [];

  render(el: ElementRef) {
    const { DataView } = DataSet;

    const dv = new DataView().source(this.data);
    dv.transform({
      type: 'fold',
      fields: this.fields,
      key: '月份', // key字段
      value: '月均降雨量', // value字段
    });
    // data = dv.rows;
    const chart = new G2.Chart({
      container: el.nativeElement,
      forceFit: true,
      height: 500,
    });
    chart.source(dv);
    chart
      .intervalStack()
      .position('月份*月均降雨量')
      .color('name');
    chart.render();
  }
}
