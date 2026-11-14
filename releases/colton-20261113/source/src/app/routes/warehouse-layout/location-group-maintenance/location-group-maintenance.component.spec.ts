import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance.component';

describe('WarehouseLayoutLocationGroupMaintenanceComponent', () => {
  let component: WarehouseLayoutLocationGroupMaintenanceComponent;
  let fixture: ComponentFixture<WarehouseLayoutLocationGroupMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutLocationGroupMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutLocationGroupMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
