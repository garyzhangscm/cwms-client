import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilCustomReportMaintenanceComponent } from './custom-report-maintenance.component';

describe('UtilCustomReportMaintenanceComponent', () => {
  let component: UtilCustomReportMaintenanceComponent;
  let fixture: ComponentFixture<UtilCustomReportMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilCustomReportMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilCustomReportMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
