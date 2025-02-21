import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcInspectionRequestMaintenanceComponent } from './qc-inspection-request-maintenance.component';

describe('QcQcInspectionRequestMaintenanceComponent', () => {
  let component: QcQcInspectionRequestMaintenanceComponent;
  let fixture: ComponentFixture<QcQcInspectionRequestMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcInspectionRequestMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcInspectionRequestMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
