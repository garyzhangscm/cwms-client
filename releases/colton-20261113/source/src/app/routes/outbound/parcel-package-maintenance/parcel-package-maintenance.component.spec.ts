import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundParcelPackageMaintenanceComponent } from './parcel-package-maintenance.component';

describe('OutboundParcelPackageMaintenanceComponent', () => {
  let component: OutboundParcelPackageMaintenanceComponent;
  let fixture: ComponentFixture<OutboundParcelPackageMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundParcelPackageMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundParcelPackageMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
