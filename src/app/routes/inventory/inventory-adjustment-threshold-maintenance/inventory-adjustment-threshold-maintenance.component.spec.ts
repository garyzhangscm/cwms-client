import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryInventoryAdjustmentThresholdMaintenanceComponent } from './inventory-adjustment-threshold-maintenance.component';

describe('InventoryInventoryAdjustmentThresholdMaintenanceComponent', () => {
  let component: InventoryInventoryAdjustmentThresholdMaintenanceComponent;
  let fixture: ComponentFixture<InventoryInventoryAdjustmentThresholdMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAdjustmentThresholdMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAdjustmentThresholdMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
