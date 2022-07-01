import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportPrinterTypeMaintenanceComponent } from './printer-type-maintenance.component';

describe('ReportPrinterTypeMaintenanceComponent', () => {
  let component: ReportPrinterTypeMaintenanceComponent;
  let fixture: ComponentFixture<ReportPrinterTypeMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportPrinterTypeMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPrinterTypeMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
