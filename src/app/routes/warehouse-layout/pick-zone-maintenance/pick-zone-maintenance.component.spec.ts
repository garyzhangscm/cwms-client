import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutPickZoneMaintenanceComponent } from './pick-zone-maintenance.component';

describe('WarehouseLayoutPickZoneMaintenanceComponent', () => {
  let component: WarehouseLayoutPickZoneMaintenanceComponent;
  let fixture: ComponentFixture<WarehouseLayoutPickZoneMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutPickZoneMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutPickZoneMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
