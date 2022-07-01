import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportPrinterMaintenanceComponent } from './printer-maintenance.component';

describe('ReportPrinterMaintenanceComponent', () => {
  let component: ReportPrinterMaintenanceComponent;
  let fixture: ComponentFixture<ReportPrinterMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportPrinterMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPrinterMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
