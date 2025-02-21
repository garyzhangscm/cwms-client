import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilExecuteCustomReportComponent } from './execute-custom-report.component';

describe('UtilExecuteCustomReportComponent', () => {
  let component: UtilExecuteCustomReportComponent;
  let fixture: ComponentFixture<UtilExecuteCustomReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilExecuteCustomReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilExecuteCustomReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
