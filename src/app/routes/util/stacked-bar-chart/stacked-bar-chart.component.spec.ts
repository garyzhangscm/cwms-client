import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilStackedBarChartComponent } from './stacked-bar-chart.component';

describe('UtilStackedBarChartComponent', () => {
  let component: UtilStackedBarChartComponent;
  let fixture: ComponentFixture<UtilStackedBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilStackedBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilStackedBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
