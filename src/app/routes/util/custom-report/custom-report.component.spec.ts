import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilCustomReportComponent } from './custom-report.component';

describe('UtilCustomReportComponent', () => {
  let component: UtilCustomReportComponent;
  let fixture: ComponentFixture<UtilCustomReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilCustomReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilCustomReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
