import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcInspectionDocumentMaintenanceComponent } from './qc-inspection-document-maintenance.component';

describe('QcQcInspectionDocumentMaintenanceComponent', () => {
  let component: QcQcInspectionDocumentMaintenanceComponent;
  let fixture: ComponentFixture<QcQcInspectionDocumentMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcInspectionDocumentMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcInspectionDocumentMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
